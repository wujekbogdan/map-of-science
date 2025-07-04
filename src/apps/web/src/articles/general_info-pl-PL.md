# Mapa nauki

Mapa Nauki powstała na podstawie danych zgromadzonych przez Center for Security and Emerging Technology (CSET),
udostępnionych Uniwersytetowi Śląskiemu w Katowicach. Emerging Technology Observatory (ETO), będące częścią CSET,
udostępnia część tych danych na swojej stronie internetowej w
postaci [własnej mapy nauki](https://sciencemap.eto.tech/). Nasze narzędzie to
przystępniejsza, „popularnonaukowa” i polskojęzyczna wersja ich mapy.

## Wprowadzenie

### Czym są „miasta” na tej mapie?

Najważniejszym elementem mapy są „miasta”, zwane technicznie klastrami. Każdy z nich
reprezentuje grupę artykułów naukowych na podobny temat, utworzoną na podstawie analizy cytowań (więcej informacji na
temat zastosowanej metody znajduje się na [stronie ETO](https://sciencemap.eto.tech/?mode=map)).

### Położenie miast na mapie.

Klastry zostały rozmieszczone w przestrzeni 2D na podstawie stopnia ich pokrewieństwa
tematycznego. W praktyce: jeżeli artykuły z klastra A często cytują artykuły z klastra B, i odwrotnie, powinny one
znaleźć się blisko siebie.

### Czym są „państwa” i ich „regiony”? Obszary na mapie zostały wydzielone ze względu na to, jak grupują się klastry.

Większe, wyraźnie oddzielone grupy klastrów zostały nazwane, biorąc pod uwagę ich wspólną tematykę. Nie zawsze
odpowiadało to tradycyjnie używanym nazwom dyscyplin naukowych. Granice między obszarami badawczymi są też płynne;
przykładowo, medycyna „płynnie” przechodzi w biochemię, a ta w chemię. Należy więc traktować zarówno granice, jak i
nazwy obszarów, z przymrużeniem oka.

## Jak korzystać z mapy?

- Obraz mapy można przybliżać i oddalać, co ujawnia lub chowa dodatkowe „miasta” i „regiony”.
- Po najechaniu kursorem nad „miasto” wyświetla się krótkie podsumowanie jego głównych cech. Liczba artykułów oznacza,
  ile artykułów naukowych składa się na dany klaster. Wskaźnik rozwoju to parametr (zakres 0-100) będący przybliżoną
  informacją na temat tego, jak szybko rośnie obecnie liczba artykułów publikowanych rocznie w czasopismach naukowych na
  tematy mieszczące się w ramach danego klastra. Słowa kluczowe zostały automatycznie wygenerowane na podstawie tekstu
  artykułów z danego klastra (lista ta może być niedoskonała).
- Po kliknięciu na „miasto” wyświetlają się dodatkowe informacje na temat danego klastra, pochodzące ze strony ETO Map
  of Science. Przycisk „Otwórz w nowym oknie” sprawia, że odpowiednia podstrona ETO otwiera się w nowym oknie
  przeglądarki.

## Ograniczenia

- "Miasta" (klastry) zostały wydzielone metodą automatyczną, która jest podatna na błędy. Stąd na mapie istnieje wiele
  klastrów, zwłaszcza tych „najmniejszych”, których nie da się sensownie zinterpretować. W praktyce, im większe
  „miasto”, tym większa szansa, że stanowi dobrze wydzieloną grupę, o tożsamości zrozumiałej dla człowieka.
- Z tego samego powodu położenia miast nie zawsze są optymalne. Przykładowo, można znaleźć klastry, które znajdują się w
  nieoczekiwanych miejscach, np. otoczone klastrami na zupełnie inny temat. Warto pamiętać, że samo rozmieszczenie
  poszczególnych tematów na tej mapie wyłoniło się algorytmicznie. Czasem ilustruje autentyczne głębokie powiązania
  między dyscyplinami (np. fakt, że badania języka znalazły się tuż obok computer science), a czasem jest po prostu
  artefaktem metody (np. położenie obszaru "Zęby").
- Regiony na mapie i ich nazwy, a także nazwy wybranych miast, zostały utworzone ręcznie przez kierownika projektu (
  Łukasz Lamża). Należy je traktować jako roboczą hipotezę, która z czasem zostanie dopracowana przy udziale ekspertów z
  poszczególnych dziedzin.

## Kto stworzył tę mapę?

- Idea, projekt, podział na obszary, nazwy polskie: Łukasz Lamża
- Programowanie, projekt graficzny: Szymon Bednorz, Cezary Buliszak
- Baza danych klastrów: Center for Security and Emerging Technology (CSET)
