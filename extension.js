var vscode = require( 'vscode' );
var micromatch = require( 'micromatch' );

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
                var fileWatcher = vscode.workspace.createFileSystemWatcher( watcher.files );
                debug( "Created watcher for " + watcher.files );

                fileWatchers.push( fileWatcher );
                context.subscriptions.push( fileWatcher );

                fileWatcher.onDidCreate( function( uri )
                {
                    debug( uri + " changed..." );
                    vscode.workspace.openTextDocument( uri ).then( function( document )
                    {
                        vscode.window.showTextDocument( document ).then( function( editor )
                        {
                            var stop = false;
                            var content = editor.document.getText();
                            watcher.actions.map( function( action )
                            {
                                if( action.glob )
                                {
                                    debug( "Check glob " + action.glob );
                                }
                                if( action.glob === undefined || ( stop === false && micromatch.isMatch( document.fileName, action.glob ) ) )
                                {
                                    if( action.glob )
                                    {
                                        debug( "Matched" );
                                    }
                                    var regex = new RegExp( action.regex, "gm" );
                                    debug( "Replacing " + action.regex );
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
                                        var range = new vscode.Range( document.positionAt( match.index ), document.positionAt( match.index + match[ 0 ].length ) );
                                        debug( "Inserting snippet " + snippet );
                                        editor.insertSnippet( new vscode.SnippetString( snippet ), range, { undoStopBefore: false, undoStopAfter: false } );
                                    }
                                    if( action.stop === true )
                                    {
                                        stop = true;
                                        debug( "Stop processing actions" );
                                    }
                                }
                            } );
                        } );
                    } );
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
