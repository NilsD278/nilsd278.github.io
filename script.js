let aktuellesKapitel = 0;
let animationsGeschwindigkeit = 2.5;
const kapitel = document.querySelectorAll(".kapitel");
const punkte = document.querySelectorAll(".fortschritt-punkte .punkt");
let animiert = false;

// Wir holen die Pfeile sicher über ihre CSS-Klassen
const pfeilOben = document.querySelector(".pfeil.oben");
const pfeilUnten = document.querySelector(".pfeil.unten");

// Sicherheits-Check beim Laden
pfeileUndPunkteAktualisieren();

function pfeilKlick(richtung) {
    const zielKapitel = aktuellesKapitel + richtung;
    wechseln(zielKapitel);
}

function punktKlick(zielSeite) {
    wechseln(zielSeite);
}

function wechseln(neu) {
    // 1. Grundcheck bleibt: Nicht außerhalb der Kapitel springen oder aufs selbe Kapitel
    if (neu < 0 || neu >= kapitel.length || neu === aktuellesKapitel) {
        return;
    }

    const alt = aktuellesKapitel;
    const abstand = Math.abs(neu - alt);
    const gesamtDauer = abstand === 1 ? animationsGeschwindigkeit : (animationsGeschwindigkeit * 0.5) + (abstand * 0.1); 

    // ==========================================================================
    // DIE RETTUNG FÜR SCHNELLE KLICKER:
    // Falls noch eine Animation läuft, brechen wir sie sofort ab und räumen auf,
    // damit die neue Animation sauber und ohne Ruckler von der aktuellen Position startet.
    // ==========================================================================
    if (animiert) {
        kapitel.forEach((k) => {
            // Wir entfernen den EventListener, damit das alte "aufraeumen" nicht dazwischenfunkt
            k.removeEventListener("transitionend", k._aktuelleAufraeumFunktion);
        });
    }

    animiert = true;

    // Alle beteiligten Kapitel aufreihen
    kapitel.forEach((k, index) => {
        const istBeteiligt = (index >= alt && index <= neu) || (index >= neu && index <= alt);
        if (istBeteiligt) {
            k.style.transition = "none";
            k.style.opacity = "1";
            k.style.zIndex = "3";
            const relativerAbstand = index - alt;
            k.style.transform = `translateY(${relativerAbstand * 100}%)`;
        }
    });

    void kapitel[0].offsetWidth; // Reflow

    // Band herbeiziehen
    kapitel.forEach((k, index) => {
        const istBeteiligt = (index >= alt && index <= neu) || (index >= neu && index <= alt);
        if (istBeteiligt) {
            k.style.transition = `transform ${gesamtDauer}s cubic-bezier(0.25, 1, 0.5, 1)`;
            const zielAbstand = index - neu;
            k.style.transform = `translateY(${zielAbstand * 100}%)`;
        }
    });

    kapitel[neu].style.pointerEvents = "auto";
    kapitel[alt].style.pointerEvents = "none";

    aktuellesKapitel = neu;
    pfeileUndPunkteAktualisieren();

    // Aufräum-Funktion vorbereiten
    function aufraeumen() {
        kapitel.forEach((k, index) => {
            if (index !== aktuellesKapitel) {
                k.style.transition = "none";
                k.style.opacity = "0";
                k.style.transform = "translateY(100%)";
                k.style.zIndex = "1";
                k.style.pointerEvents = "none";
            }
        });

        animiert = false;
        kapitel[neu].removeEventListener("transitionend", aufraeumen);
    }

    // Wir merken uns die Funktion direkt am Element, um sie bei schnellen Klicks löschen zu können
    kapitel[neu]._aktuelleAufraeumFunktion = aufraeumen;
    kapitel[neu].addEventListener("transitionend", aufraeumen);
}

function pfeileUndPunkteAktualisieren() {
    if (!pfeilOben || !pfeilUnten) return;

    // 1. Oberen Pfeil steuern (Auf Seite 0 unsichtbar, sonst sichtbar)
    if (aktuellesKapitel === 0) {
        pfeilOben.classList.remove("sichtbar");
    } else {
        pfeilOben.classList.add("sichtbar");
    }

    // 2. Unteren Pfeil steuern (Auf der letzten Seite unsichtbar, sonst sichtbar)
    if (aktuellesKapitel === kapitel.length - 1) {
        pfeilUnten.classList.remove("sichtbar");
    } else {
        pfeilUnten.classList.add("sichtbar");
    }

    // 3. Punkte färben
    if (punkte.length > 0) {
        punkte.forEach((punkt, index) => {
            if (index <= aktuellesKapitel) {
                punkt.classList.add("aktiv");
            } else {
                punkt.classList.remove("aktiv");
            }
        });
    }
}

document.addEventListener("DOMContentLoaded", function() {
    const pfeilOben = document.querySelector(".pfeil.oben");
    const pfeilUnten = document.querySelector(".pfeil.unten");

    const bilder = document.querySelectorAll('.quellen-bild');

    bilder.forEach(bild => {
        bild.addEventListener('click', function() {
            // Erstelle ein Overlay-Div
            const overlay = document.createElement('div');
            overlay.className = 'bild-overlay';
            
            // Kopiere das Bild ins Overlay
            const imgKopie = document.createElement('img');
            imgKopie.src = this.src;
            
            overlay.appendChild(imgKopie);
            document.body.appendChild(overlay);
            
            // Schließen beim Klick auf das Overlay
            overlay.addEventListener('click', function() {
                this.remove();
            });
        });
    });

    // Alle Sonderseiten und deren Buttons registrieren
    document.querySelectorAll('.sonderseite').forEach(seite => {
        const subPunkte = seite.querySelectorAll('.sub-punkt');
        const subseiten = seite.querySelectorAll('.aufgaben-subseite');
        const abschlussScreen = seite.querySelector('.abschluss-bildschirm');
        const quellen = seite.querySelector('.quellen-bereich');
        const markerBtn = document.getElementById('markerBtn'); // Hier den Button holen
        const goKapitel3Btn = seite.querySelector('.kapitel3-btn');

        // Funktion: Punkt-Optik auf DIESER Seite aktualisieren
        function wechslePunkt(ziel) {
            subPunkte.forEach(p => p.classList.toggle('aktiv', p.getAttribute('data-ziel') === ziel));
        }

        // Funktion: Unterseiten/Abschluss auf DIESER Seite anzeigen
        function zeigeSichtbares(ziel) {
            subseiten.forEach(s => s.classList.remove('sichtbar', 'nach-links-raus', 'von-links-warten'));
            if(abschlussScreen) abschlussScreen.classList.remove('aktiv');
            if(quellen) quellen.classList.remove('quellen-versteckt');

            if(markerBtn) markerBtn.classList.remove('ausblenden');

            if (ziel === 'A') subseiten[0].classList.add('sichtbar');
            else if (ziel === 'B') {
                subseiten[0].classList.add('nach-links-raus');
                subseiten[1].classList.add('sichtbar');
            } else if (ziel === 'Abschluss') {
                if(abschlussScreen) abschlussScreen.classList.add('aktiv');
                if(quellen) quellen.classList.add('quellen-versteckt');
                if(markerBtn) markerBtn.classList.add('ausblenden');
            }
        }

        // Punkt-Klick-Logik
        subPunkte.forEach(punkt => {
            punkt.addEventListener('click', function() {
                const ziel = this.getAttribute('data-ziel');
                if (ziel === 'start') {
                    seite.classList.remove('aktiv');
                    if (pfeilOben) pfeilOben.classList.add('sichtbar');
                    if (pfeilUnten) pfeilUnten.classList.add('sichtbar');
                } else if (ziel === 'aufgaben1') {
                    zeigeSichtbares('A');
                    wechslePunkt('aufgaben1');
                } else if (ziel === 'aufgaben2') {
                    zeigeSichtbares('B');
                    wechslePunkt('aufgaben2');
                } else if (ziel === 'abschluss') {
                    zeigeSichtbares('Abschluss');
                    wechslePunkt('abschluss');
                }
            });
        });

        // Abschluss-Button Logik
        if(goKapitel3Btn) {
            goKapitel3Btn.addEventListener('click', () => {
                seite.classList.remove('aktiv');
                if (pfeilUnten) pfeilUnten.click();
            });
        }
    });

    // "Los geht's" Button Logik
    document.querySelectorAll('.weiter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // Findet die direkt folgende Sonderseite
            const naechsteSeite = this.closest('section').nextElementSibling;
            if(naechsteSeite && naechsteSeite.classList.contains('sonderseite')) {
                naechsteSeite.classList.add('aktiv');
                naechsteSeite.querySelector('.sub-punkt[data-ziel="aufgaben1"]').click();
                if (pfeilOben) pfeilOben.classList.remove('sichtbar');
                if (pfeilUnten) pfeilUnten.classList.remove('sichtbar');
            }
        });
    });
});

document.getElementById('markerBtn').addEventListener('click', function() {
    const selection = window.getSelection();

    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);

        // Prüfen, ob die Auswahl innerhalb des Quellenbereichs liegt
        if (range.commonAncestorContainer.parentElement.closest('.quellen-bereich')) {
            
            // 1. Erstelle ein span mit der highlight-Klasse
            const span = document.createElement('span');
            span.className = 'highlight';

            // 2. Extrahiere den markierten Text in das span
            try {
                range.surroundContents(span);
                selection.removeAllRanges();
            } catch (e) {
                // Falls die Auswahl über mehrere Elemente geht, greift dieser Fallback:
                alert("Bitte markiere nur innerhalb eines einzigen Textblocks (keine Überschriften oder Bilder einschließen).");
            }
        }
    }
});