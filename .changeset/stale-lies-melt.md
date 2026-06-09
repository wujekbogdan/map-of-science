---
"@map-of-science/cli": major
---

Disable the `scrape-eto` command. It consumed the PDF parser, which has been replaced by a JSONL-based cluster parser that is not yet wired into the command.
