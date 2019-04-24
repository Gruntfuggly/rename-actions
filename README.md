# Rename Actions

This extension automatically updates parts of a file when the file is renamed.

<img src="https://raw.githubusercontent.com/Gruntfuggly/rename-actions/master/video.gif">

When a rename is detected<sup>\*</sup>, it searches through a list of
regular expressions and replaces them with [snippets]
(https://code.visualstudio.com/docs/editor/userdefinedsnippets#_creating-your-own-snippets).

This is useful if you have comment headers or include guards which are based on
the file name, for example.

<small><sup>\*</sup>Actually, whenever a file is created, but newly created
files will be empty and therefore no changes will be made. The changes will be
applied to files that are renamed or copied into the workspace folder.</small>

## Configuration

`rename-actions.watchers`

An array of watchers, consisting of a file pattern glob to match files and an
array of glob/regex/snippet to locate and replace in the document. The `files`
glob is a standard javascript glob (using a vscode FileWatcher). The glob for
each action uses [micromatch](https://github.com/micromatch/micromatch) which
allows for more advanced patterns.

Glob patterns can include environment variables such as `${USER}` and also the
vscode specific `${workspaceFolder}`.

Example:

```
"rename-actions.watchers": [
    {
        "files": "**/{*.h,*.cpp}",
        "actions": [
            {
                "glob": "**/*.h",
                "regex": "^// \\\\brief Filename: .*$",
                "snippet": "// \\brief Filename: ${TM_FILENAME}"
            },
         ]
    }
]
```

The actions are processed in order of definition within the array. If an action
has the "stop" property set to true, no further actions will be processed for
the file.

If the regex contains capture groups, these can be reinserted into the snippet
using `${CAPn}`. For example:

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

### Expanded Example

```
"rename-actions.watchers": [
    {
        "files": "${workspaceFolder}/{*.h,*.cpp}",
        "actions": [
            {
                "glob": "${workspaceFolder}/*.h",
                "regex": "^\\/\\*\\! \\\\file\\s*(.*)$",
                "snippet": "/*! \\file   ${TM_FILENAME}"
            },
            {
                "glob": "${workspaceFolder}/*.h",
                "regex": "^#ifndef (.*)_H$",
                "snippet": "#ifndef ${TM_FILENAME_BASE/(([A-Z]+)+([a-z_]+))?/$2${3:/upcase}${3:+_}/g}H"
            },
            {
                "glob": "${workspaceFolder}/*.h",
                "regex": "^#define (.*)_H$",
                "snippet": "#define ${TM_FILENAME_BASE/(([A-Z]+)+([a-z_]+))?/$2${3:/upcase}${3:+_}/g}H"
            },
            {
                "glob": "${workspaceFolder}/*.h",
                "regex": "^#endif \\/\\*(.*)_H\\s\\*\\/$",
                "snippet": "#endif /* ${TM_FILENAME_BASE/(([A-Z]+)+([a-z_]+))?/$2${3:/upcase}${3:+_}/g}H */"
            },
            {
                "glob": "${workspaceFolder}/gtest/ut-*.cpp",
                "regex": "^TEST\\(\\s.*,\\s(.*)\\s\\)$",
                "snippet": "TEST( ${TM_FILENAME/ut-(.*)\\..+$/$1/}, ${CAP1} )",
                "stop": true
            },
            {
                "glob": "${workspaceFolder}/*.cpp",
                "regex": "^\\/\\*\\! \\\\file\\s*(.*)$",
                "snippet": "/*! \\file   ${TM_FILENAME}"
            }
        ]
    }
]
```

## Installing

You can install the latest version of the extension via the Visual Studio
Marketplace [here](https://marketplace.visualstudio.com/items?itemName=Gruntfuggly.rename-actions).

### Source Code

The source code is available on GitHub [here]
(https://github.com/Gruntfuggly/rename-actions).

## Credits

Icon made by <a href="https://www.flaticon.com/authors/smashicons" title="Smashicons">
Smashicons</a> from <a href="https://www.flaticon.com/" title="Flaticon">
www.flaticon.com</a> is licensed by <a
href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0"
target="_blank">CC 3.0 BY</a></div>

