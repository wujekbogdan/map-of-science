# Map of Science

The Map of Science was created based on data collected by the Center for Security and Emerging Technology (CSET), made available to the University of Silesia in Katowice. The Emerging Technology Observatory (ETO), which is part of CSET, shares some of this data on its website in the form of [ETO Map of Science](https://sciencemap.eto.tech/). Our tool is a more accessible, 'popularized' Polish-language version of their map, with added content.

## Introduction

### What are the 'cities' on this map?

The most important elements of the map are the 'cities', technically called clusters. Each represents a group of scientific articles on a similar topic, created based on citation analysis (more information on the method can be found on the [ETO website](https://sciencemap.eto.tech/?mode=map).

### The positioning of cities

Clusters were placed in a 2D space based on their relatedness. In practice: if articles in cluster A often cite articles from cluster B, and vice versa, they should be located close to each other.

### What are the 'countries' and their 'regions'?

Areas on the map were defined based on how clusters group together. Larger, clearly separated groups of clusters were named based on their shared subject matter. This didn’t always correspond to traditional scientific disciplines, so their names should be taken with a grain of salt. The boundaries between research areas are also fluid. For example, medicine 'blends' into biochemistry, which blends into chemistry.

## How to use the map?

- You can zoom in and out of the map, which reveals or hides additional 'cities' and 'regions'. The map always displays only a certain number of largest clusters in the areas visible at the moment. You can change this number (which is 500 by default) using the function "Cluster count" at the top right.
- If you hover over a cluster, a short summary of its main features is shown. The number of articles indicates how many scientific papers make up that cluster. The growth rate is a parameter (range 0-100) giving an approximate idea of how quickly the number articles in that cluster has been growing during the past 3 years. Keywords were automatically generated based on the text of articles in the cluster (this list may be imperfect).
- When you click on a cluster, more information about that cluster is presented, taken from the ETO Map of Science website. The tab "Articles and sources" contains links to most important scientific articles within the given cluster. The “Open in a new tab” button opens the relevant ETO subpage in a new browser tab.
- When you click on a region, more information about that area of science is presented. At the beta stage, this only includes a list of relevant segments of a Polish-language popular science YouTube show "Czytamy naturę".

## Limitations

- The clusters were generated using an automated method, which is prone to errors. There are many clusters on the map - especially smaller ones - that are hard to interpret meaningfully. In practice, the bigger the cluster, the more likely it represents a well-defined group with a clearly understandable identity.
- For the same reason, the positioning of clusters isn't always optimal. You may find clusters located in odd places, surrounded by clusters on completely different topics. It’s worth remembering that the arrangement of topics on this map was generated algorithmically. Sometimes it illustrates real deep connections between disciplines (like language research being placed next to computer science), and sometimes it's just an artifact of the method (e.g. the location of the "Teeth" area). Simply put, not everything on this map makes sense, and users should beware of reading too much into any particular detail related to clusters and their arrangement.
- Regions on the map and their names, as well as the names of selected clusters, were created manually by the project lead (Łukasz Lamża). They should be treated as a working hypothesis, to be refined over time with input from experts in each field.

## Who created this map?

- Idea, project, region division, Polish names: Łukasz Lamża
- Programming, graphic design: Szymon Bednorz, Cezary Buliszak
- Cluster database: [Center for Security and Emerging Technology (CSET)](https://cset.georgetown.edu)
