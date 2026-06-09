# @map-of-science/eto-cluster-parser

Parse ETO `cluster_details` records into structured data. Domain layer.

## Responsibilities

- Map a raw ETO cluster record (one JSONL line) to a `ParsedCluster`
- Normalize values: coerce strings to numbers, split the packed title into title and metadata
- Group articles into core, review, and highly cited; keep the top journals, institutions, and companies
