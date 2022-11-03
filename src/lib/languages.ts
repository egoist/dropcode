import { javascript } from "@codemirror/lang-javascript"
import { LanguageSupport, StreamLanguage } from "@codemirror/language"
import { rust } from "@codemirror/lang-rust"
import { python } from "@codemirror/lang-python"
import { css } from "@codemirror/lang-css"
import { html } from "@codemirror/lang-html"
import { xml } from "@codemirror/lang-xml"
import { markdown } from "@codemirror/lang-markdown"
import { json } from "@codemirror/lang-json"
import { cpp } from "@codemirror/lang-cpp"
import { java } from "@codemirror/lang-java"
import { sql } from "@codemirror/lang-sql"
import { php } from "@codemirror/lang-php"
import { ruby } from "@codemirror/legacy-modes/mode/ruby"
import { go } from "@codemirror/legacy-modes/mode/go"
import { erlang } from "@codemirror/legacy-modes/mode/erlang"
import { haskell } from "@codemirror/legacy-modes/mode/haskell"
import { lua } from "@codemirror/legacy-modes/mode/lua"
import { nginx } from "@codemirror/legacy-modes/mode/nginx"
import { swift } from "@codemirror/legacy-modes/mode/swift"
import { yaml } from "@codemirror/legacy-modes/mode/yaml"
import { toml } from "@codemirror/legacy-modes/mode/toml"
import { clojure } from "@codemirror/legacy-modes/mode/clojure"
import { crystal } from "@codemirror/legacy-modes/mode/crystal"
import { dockerFile } from "@codemirror/legacy-modes/mode/dockerfile"
import { sass } from "@codemirror/legacy-modes/mode/sass"
import { powerShell } from "@codemirror/legacy-modes/mode/powershell"
import { dart, kotlin, scala } from "@codemirror/legacy-modes/mode/clike"
import { r } from "@codemirror/legacy-modes/mode/r"
import { oCaml, fSharp } from "@codemirror/legacy-modes/mode/mllike"
import { commonLisp } from "@codemirror/legacy-modes/mode/commonlisp"

export const languages: {
  id: string
  name: string
  extension?: () => LanguageSupport | StreamLanguage<unknown>
}[] = [
  {
    id: "plaintext",
    name: "Plain Text",
  },
  {
    id: "javascript",
    name: "JavaScript",
    extension: () => javascript(),
  },
  {
    id: "jsx",
    name: "JSX",
    extension: () => javascript({ jsx: true }),
  },
  {
    id: "typescript",
    name: "TypeScript",
    extension: () => javascript({ typescript: true }),
  },
  {
    id: "tsx",
    name: "TSX",
    extension: () => javascript({ typescript: true, jsx: true }),
  },
  {
    id: "python",
    name: "Python",
    extension: () => python(),
  },
  {
    id: "rust",
    name: "Rust",
    extension: () => rust(),
  },
  {
    id: "css",
    name: "CSS",
    extension: () => css(),
  },
  {
    id: "html",
    name: "HTML",
    extension: () => html(),
  },
  {
    id: "vue",
    name: "Vue",
    extension: () => html(),
  },
  {
    id: "svelte",
    name: "Svelte",
    extension: () => html(),
  },
  {
    id: "xml",
    name: "XML",
    extension: () => xml(),
  },
  {
    id: "markdown",
    name: "Markdown",
    extension: () => markdown(),
  },
  {
    id: "cpp",
    name: "C++",
    extension: () => cpp(),
  },
  {
    id: "c",
    name: "C",
    extension: () => cpp(),
  },
  {
    id: "csharp",
    name: "C#",
    extension: () => cpp(),
  },
  {
    id: "java",
    name: "Java",
    extension: () => java(),
  },
  {
    id: "sql",
    name: "SQL",
    extension: () => sql(),
  },
  {
    id: "php",
    name: "PHP",
    extension: () => php(),
  },
  {
    id: "ruby",
    name: "Ruby",
    extension: () => StreamLanguage.define(ruby),
  },
  {
    id: "go",
    name: "Go",
    extension: () => StreamLanguage.define(go),
  },
  {
    id: "erlang",
    name: "Erlang",
    extension: () => StreamLanguage.define(erlang),
  },
  {
    id: "haskell",
    name: "Haskell",
    extension: () => StreamLanguage.define(haskell),
  },
  {
    id: "lua",
    name: "Lua",
    extension: () => StreamLanguage.define(lua),
  },
  {
    id: "nginx",
    name: "Ngix",
    extension: () => StreamLanguage.define(nginx),
  },
  {
    id: "swift",
    name: "Swift",
    extension: () => StreamLanguage.define(swift),
  },
  {
    id: "yaml",
    name: "YAML",
    extension: () => StreamLanguage.define(yaml),
  },
  {
    id: "toml",
    name: "TOML",
    extension: () => StreamLanguage.define(toml),
  },
  {
    id: "clojure",
    name: "Clojure",
    extension: () => StreamLanguage.define(clojure),
  },
  {
    id: "crystal",
    name: "Crystal",
    extension: () => StreamLanguage.define(crystal),
  },
  {
    id: "dockerfile",
    name: "Dockerfile",
    extension: () => StreamLanguage.define(dockerFile),
  },
  {
    id: "sass",
    name: "Sass",
    extension: () => StreamLanguage.define(sass),
  },
  {
    id: "json",
    name: "JSON",
    extension: () => json(),
  },
  {
    id: "powershell",
    name: "PowerShell",
    extension: () => StreamLanguage.define(powerShell),
  },
  {
    id: "dart",
    name: "Dart",
    extension: () => StreamLanguage.define(dart),
  },
  {
    id: "kotlin",
    name: "Kotlin",
    extension: () => StreamLanguage.define(kotlin),
  },
  {
    id: "scala",
    name: "Scala",
    extension: () => StreamLanguage.define(scala),
  },
  {
    id: "r",
    name: "R",
    extension: () => StreamLanguage.define(r),
  },
  {
    id: "ocaml",
    name: "OCaml",
    extension: () => StreamLanguage.define(oCaml),
  },
  {
    id: "fsharp",
    name: "F#",
    extension: () => StreamLanguage.define(fSharp),
  },
  {
    id: "commonlisp",
    name: "Common Lisp",
    extension: () => StreamLanguage.define(commonLisp),
  },
].sort((a, b) => {
  return a.name < b.name ? -1 : 1
})

export const getLanguageName = (id: string) =>
  languages.find((lang) => lang.id === id)?.name
