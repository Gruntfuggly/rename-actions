var vscode = require( 'vscode' );
var micromatch = require( 'micromatch' );
var fs = require( 'fs' );
var path = require( 'path' );
var exec = require( 'child_process' ).execSync;

var fileWatchers = [];

function activate( context )
{
    var outputChannel;

    function resetOutputChannel()
    {
        if( outputChannel )
        {
            outputChannel.dispose();
            outputChannel = undefined;
        }
        if( vscode.workspace.getConfiguration( 'rename-actions' ).debug === true )
        {
            outputChannel = vscode.window.createOutputChannel( "Rename Actions" );
        }
    }

    function debug( text )
    {
        if( outputChannel )
        {
            outputChannel.appendLine( text );
        }
    }

    function substituteVariables( glob )
    {
        if( glob.indexOf( "${workspaceFolder}" ) > -1 && vscode.workspace.rootPath )
        {
            debug( "Replacing ${workspaceFolder} with '" + vscode.workspace.rootPath + "' in " + glob );
            glob = glob.replace( /\$\{workspaceFolder\}/g, vscode.workspace.rootPath );
        }
        var envRegex = new RegExp( "\\$\\{(.*?)\\}", "g" );
        glob = glob.replace( envRegex, function( match, name )
        {
            var replacement = process.env[ name ];
            debug( "Replacing ${" + name + "} with '" + replacement + "' in " + glob );
            return replacement ? replacement : "";
        } );

        return glob;
    }

    function createFileWatchers()
    {
        fileWatchers.map( function( fileWatcher )
        {
            fileWatcher.dispose();
        } );

        var watchers = vscode.workspace.getConfiguration( 'rename-actions' ).get( 'watchers' );

        if( watchers )
        {
            watchers.map( function( watcher )
            {
                var filesGlob = substituteVariables( watcher.files );

                var fileWatcher = vscode.workspace.createFileSystemWatcher( filesGlob );
                debug( "Created watcher for " + filesGlob );

                fileWatchers.push( fileWatcher );
                context.subscriptions.push( fileWatcher );

                fileWatcher.onDidCreate( function( uri )
                {
                    outputChannel.append( uri + " changed..." );

                    if( watcher.excludes === undefined || !micromatch.isMatch( uri.fsPath, watcher.excludes ) )
                    {
                        var rebaseInProgress = false;
                        var folder = path.dirname( uri.fsPath );
                        var repo = ( exec( 'git rev-parse --show-toplevel', { cwd: folder } ) + "" ).trim();
                        if( repo !== "" )
                        {
                            var rebaseFolder = path.join( repo, '.git', 'rebase-merge' );
                            rebaseInProgress = fs.existsSync( rebaseFolder );
                        }

                        if( rebaseInProgress !== true )
                        {
                            debug( "" );
                            var stop = false;
                            watcher.actions.map( function( action )
                            {
                                var glob = substituteVariables( action.glob );

                                if( glob )
                                {
                                    debug( "Check glob " + glob );
                                }
                                if( glob === undefined || ( stop === false && micromatch.isMatch( uri.fsPath, glob ) ) )
                                {
                                    if( glob )
                                    {
                                        debug( "Matched" );
                                    }
                                    vscode.window.showTextDocument( uri, { preview: false } ).then( function( editor )
                                    {
                                        var content = editor.document.getText();
                                        var regex = new RegExp( action.regex, "gm" );
                                        debug( "Replacing " + action.regex + " in " + editor.document.fileName );
                                        var matches = 0;
                                        while( ( match = regex.exec( content ) ) !== null )
                                        {
                                            var snippet = action.snippet;
                                            match.map( function( group, index )
                                            {
                                                if( index > 0 )
                                                {
                                                    snippet = snippet.replace( new RegExp( "\\$\\{CAP" + index + "}", "g" ), match[ index ] );
                                                }
                                            } );
                                            var range = new vscode.Range( editor.document.positionAt( match.index ), editor.document.positionAt( match.index + match[ 0 ].length ) );
                                            debug( "Inserting snippet " + snippet );
                                            editor.insertSnippet( new vscode.SnippetString( snippet ), range, { undoStopBefore: false, undoStopAfter: false } );
                                            ++matches;
                                        }
                                        if( matches > 0 )
                                        {
                                            debug( "Replaced " + matches + " instances" );
                                        }
                                        else
                                        {
                                            debug( "No matches found" );
                                        }
                                        if( action.stop === true )
                                        {
                                            stop = true;
                                            debug( "Stop processing actions" );
                                        }
                                    } );
                                }
                            } );
                        }
                        else
                        {
                            debug( "rebase in progress" );
                        }
                    }
                    else
                    {
                        debug( "excluded" );
                    }
                } );
            } );
        }
    }

    context.subscriptions.push( vscode.workspace.onDidChangeConfiguration( function( e )
    {
        if( e.affectsConfiguration( "rename-actions.debug" ) )
        {
            resetOutputChannel();
        }
        else if( e.affectsConfiguration( "rename-actions" ) )
        {
            createFileWatchers();
        }
    } ) );

    resetOutputChannel();
    createFileWatchers();
}

function deactivate()
{
    fileWatchers.map( function( fileWatcher )
    {
        fileWatcher.dispose();
    } );
}

exports.activate = activate;
exports.deactivate = deactivate;
