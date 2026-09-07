# Elite Menu — GitHub Pages

Ta wersja nie potrzebuje Node.js, Rendera, Railway ani własnego backendu.

GitHub Actions:
1. pobiera menu z Dietly,
2. generuje `menu-data.json`,
3. wdraża całą PWA na GitHub Pages,
4. aktualizuje menu co godzinę.

## Wrzucenie

1. Utwórz repo na GitHubie.
2. Wgraj **całą zawartość tego ZIP-a do głównego katalogu repo** — również folder `.github`.
3. Repo może używać brancha `main` albo `master`.
4. W GitHub: **Settings → Pages → Source → GitHub Actions**.
5. Wejdź w **Actions → Update menu and deploy Pages** i poczekaj na zakończenie pierwszego uruchomienia.
6. Otwórz adres GitHub Pages.

Potem wszystko aktualizuje się automatycznie co godzinę.

## Ważne

Nie wgrywaj samego folderu `public` — w tej wersji pliki strony są celowo bezpośrednio w katalogu głównym repo.
