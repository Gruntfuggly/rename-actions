var vscode = require( 'vscode' );

var fileWatchers = [];

function activate( context )
{
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
                var fileWatcher = vscode.workspace.createFileSystemWatcher( watcher.glob );
                console.log( "Created watcher for " + watcher.glob );

                fileWatchers.push( fileWatcher );
                context.subscriptions.push( fileWatcher );

                fileWatcher.onDidCreate( function( uri )
                {
                    console.log( uri + " changed..." );
                    vscode.workspace.openTextDocument( uri ).then( function( document )
                    {
                        vscode.window.showTextDocument( document ).then( function( editor )
                        {
                            var content = editor.document.getText();
                            watcher.actions.map( function( action )
                            {
                                var regex = new RegExp( action.regex, "gm" );
                                console.log( "Replacing " + action.regex );
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
                                    console.log( "Inserting snippet " + snippet );
                                    editor.insertSnippet( new vscode.SnippetString( snippet ), range, { undoStopBefore: false, undoStopAfter: false } );
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
        if( e.affectsConfiguration( "rename-actions" ) )
        {
            createFileWatchers();
        }
    } ) );

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
