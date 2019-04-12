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
                var fileWwatcher = vscode.workspace.createFileSystemWatcher( watcher.glob );
                fileWatchers.push( fileWwatcher );
                context.subscriptions.push( fileWwatcher );

                fileWwatcher.onDidCreate( function( uri )
                {
                    vscode.workspace.openTextDocument( uri ).then( function( document )
                    {
                        vscode.window.showTextDocument( document ).then( function( editor )
                        {
                            var content = editor.document.getText();
                            watcher.actions.map( function( action )
                            {
                                var regex = new RegExp( action.regex, "gm" );
                                while( ( match = regex.exec( content ) ) !== null )
                                {
                                    var range = new vscode.Range( document.positionAt( match.index ), document.positionAt( match.index + match[ 0 ].length ) );
                                    editor.insertSnippet( new vscode.SnippetString( action.snippet ), range );
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
