# Map of Science

The Map of Science was created based on data collected by the Center for Security and Emerging Technology (CSET), made available to the University of Silesia in Katowice. The Emerging Technology Observatory (ETO), which is part of CSET, shares some of this data on its website in the form of [its own science map](https://sciencemap.eto.tech/). Our tool is a more accessible, “popular science” and Polish-language version of their map.

## Introduction

### What are the "cities" on this map?

The most important elements of the map are the “cities”, technically called clusters. Each represents a group of scientific articles on a similar topic, created based on citation analysis (more on the method used can be found on the [ETO page](https://sciencemap.eto.tech/?mode=map)).

### The positioning of cities on the map

Clusters were placed in a 2D space based on how thematically related they are. In practice: if articles in cluster A often cite articles from cluster B, and vice versa, they should be located close to each other.

### What are the "countries" and their "regions"?

Areas on the map were defined based on how clusters group together. Larger, clearly separated groups of clusters were named with regard to their shared subject matter. This didn’t always correspond to traditional scientific disciplines. The boundaries between research areas are also fluid; for example, medicine “blends” into biochemistry, and that into chemistry. So both the boundaries and the area names should be taken with a grain of salt.

## How to use the map?

- You can zoom in and out of the map, which reveals or hides additional “cities” and “regions”.
- When hovering over a “city”, a short summary of its main features is shown. The number of articles indicates how many scientific papers make up that cluster. The development index is a parameter (range 0-100) giving an approximate idea of how quickly the number of yearly published articles in that cluster is growing. Keywords were automatically generated based on the text of articles in the cluster (this list may be imperfect).
- When you click on a “city”, more information about that cluster appears, taken from the ETO Map of Science website. The “Open in new window” button opens the relevant ETO subpage in a new browser tab.

## Limitations

- The “cities” (clusters) were generated using an automated method, which is prone to errors. That’s why there are many clusters on the map - especially smaller ones - that are hard to interpret meaningfully. In practice, the bigger the “city”, the more likely it represents a well-defined group with a clearly understandable identity.
- For the same reason, the positioning of cities isn't always optimal. For example, you might find clusters located in odd places, surrounded by clusters on completely different topics. It’s worth remembering that the arrangement of topics on this map was generated algorithmically. Sometimes it illustrates real deep connections between disciplines (like language research being placed next to computer science), and sometimes it's just an artifact of the method (e.g. the location of the "Teeth" area).
- Regions on the map and their names, as well as the names of selected cities, were created manually by the project lead (Łukasz Lamża). They should be treated as a working hypothesis, to be refined over time with input from experts in each field.

## Who created this map?

- Idea, project, region division, Polish names: Łukasz Lamża
- Programming, graphic design: Szymon Bednorz, Cezary Buliszak
- Cluster database: Center for Security and Emerging Technology (CSET)
