import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black pt-28 pb-16" data-testid="terms-page">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          <h1 className="text-4xl sm:text-5xl font-bold mb-8">
            Uslovi <span className="gradient-text">Korištenja</span>
          </h1>

          <div className="prose prose-invert prose-lg max-w-none space-y-8">
            <p className="text-white/70 text-lg">
              Posljednje ažuriranje: Decembar 2024
            </p>

            <section className="glass-card rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">1. Prihvatanje Uslova</h2>
              <p className="text-white/70">
                Korištenjem Continental Academy platforme, prihvatate ove uslove korištenja. 
                Ako se ne slažete s bilo kojim dijelom uslova, molimo vas da ne koristite 
                naše usluge.
              </p>
            </section>

            <section className="glass-card rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">2. Opis Usluge</h2>
              <p className="text-white/70">
                Continental Academy je online platforma za obrazovanje koja nudi video kurseve, 
                edukativne materijale i pristup zajednici. Usluge su dostupne korisnicima 
                sa aktivnom pretplatom.
              </p>
            </section>

            <section className="glass-card rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">3. Registracija i Račun</h2>
              <ul className="list-disc list-inside text-white/70 space-y-2">
                <li>Morate imati najmanje 18 godina za kreiranje računa</li>
                <li>Odgovorni ste za sigurnost svojih pristupnih podataka</li>
                <li>Ne smijete dijeliti svoj račun s drugima</li>
                <li>Morate pružiti tačne i potpune informacije</li>
              </ul>
            </section>

            <section className="glass-card rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">4. Pretplata i Plaćanje</h2>
              <ul className="list-disc list-inside text-white/70 space-y-2">
                <li>Pretplate se naplaćuju unaprijed</li>
                <li>Cijene su izražene u eurima (€)</li>
                <li>Otkazivanje pretplate vrši se putem kontakta sa podrškom</li>
                <li>Korisnici ne mogu sami otkazati pretplatu - to radi admin tim</li>
                <li>Nudimo 30-dnevnu garanciju povrata novca</li>
              </ul>
            </section>

            <section className="glass-card rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">5. Intelektualna Svojina</h2>
              <p className="text-white/70">
                Sav sadržaj na platformi (video, tekst, grafika) je vlasništvo Continental Academy. 
                Zabranjeno je:
              </p>
              <ul className="list-disc list-inside text-white/70 space-y-2 mt-4">
                <li>Kopiranje ili distribucija sadržaja</li>
                <li>Snimanje kurseva</li>
                <li>Dijeljenje sadržaja s trećim licima</li>
              </ul>
            </section>

            <section className="glass-card rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">6. Zabranjena Ponašanja</h2>
              <ul className="list-disc list-inside text-white/70 space-y-2">
                <li>Korištenje platforme za nezakonite svrhe</li>
                <li>Uznemiravanje drugih korisnika</li>
                <li>Pokušaj neovlaštenog pristupa sistemu</li>
                <li>Širenje lažnih informacija</li>
              </ul>
            </section>

            <section className="glass-card rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">7. Odricanje Odgovornosti</h2>
              <p className="text-white/70">
                Continental Academy ne garantuje specifične finansijske rezultate. 
                Uspjeh zavisi od individualnog truda i primjene naučenog. 
                Nismo odgovorni za bilo kakve gubitke nastale korištenjem naših usluga.
              </p>
            </section>

            <section className="glass-card rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">8. Izmjene Uslova</h2>
              <p className="text-white/70">
                Zadržavamo pravo izmjene ovih uslova u bilo kojem trenutku. 
                O značajnim promjenama ćemo vas obavijestiti putem email-a.
              </p>
            </section>

            <section className="glass-card rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">9. Kontakt</h2>
              <p className="text-white/70">
                Za sva pitanja vezana za uslove korištenja:{' '}
                <a href="mailto:support@continental.academy" className="text-[#FF4500] hover:underline">
                  support@continental.academy
                </a>
              </p>
            </section>
          </div>

          <div className="mt-12 text-center">
            <Link to="/" className="text-[#FF4500] hover:underline">
              ← Nazad na početnu
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
