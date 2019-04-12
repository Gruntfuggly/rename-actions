# Rename Actions

This extension automatically updates parts of a file when the file is renamed.

<img src="https://raw.githubusercontent.com/Gruntfuggly/rename-actions/master/video.gif">

When a rename is detected<sup>\*</sup>, it searches through a list of
regular expressions and replaces them with [snippets](https://code.visualstudio.com/docs/editor/userdefinedsnippets#_creating-your-own-snippets).

This is useful if you have comment headers or include guards which are based on
the file name, for example.

<small><sup>\*</sup>Actually, whenever a file is created, but newly created files will be empty and therefore no changes will be made. The changes will be applied to files that are renamed or copied into the workspace folder.</small>

## Configuration

`rename-actions.watchers`

An array of watchers, consisting of a glob to match files and an array of pairs of regex/snippet to locate and replace in the document.
Example:

```
"rename-actions.watchers": [
    {
        "glob": "**/{*.h,*.cpp}",
        "actions": [
            {
                "regex": "^// \\\\brief Filename: .*$",
                "snippet": "// \\brief Filename: ${TM_FILENAME}"
            },
         ]
    }
]
```

If the regex contains capture groups, these can be reinserted into the snippet using `${CAPn}`. For example:

```
    "regex": "^TEST\\(\\s.*,\\s(.*)\\s\\)$",
    "snippet": "TEST( ${TM_FILENAME_BASE}, ${CAP1} )"
```
will change:
```
TEST( OldFile, PerformTest )
```
into
```
TEST( NewFile, PerformTest )
```

*Note: literal backslashes in the regex need to be double escaped.*

## Installing

You can install the latest version of the extension via the Visual Studio Marketplace [here](https://marketplace.visualstudio.com/items?itemName=Gruntfuggly.rename-actions).

### Source Code

The source code is available on GitHub [here](https://github.com/Gruntfuggly/rename-actions).

## Credits

Icon made by <a href="https://www.flaticon.com/authors/smashicons" title="Smashicons">Smashicons</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a></div>
