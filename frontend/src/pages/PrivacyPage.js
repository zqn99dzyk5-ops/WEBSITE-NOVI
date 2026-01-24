import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black pt-24 pb-16" data-testid="privacy-page">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          <h1 className="text-4xl sm:text-5xl font-bold mb-8">
            Politika <span className="gradient-text">Privatnosti</span>
          </h1>

          <div className="prose prose-invert prose-lg max-w-none space-y-8">
            <p className="text-white/70 text-lg">
              Posljednje ažuriranje: Decembar 2024
            </p>

            <section className="glass-card rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">1. Prikupljanje Podataka</h2>
              <p className="text-white/70">
                Continental Academy prikuplja sljedeće podatke:
              </p>
              <ul className="list-disc list-inside text-white/70 space-y-2 mt-4">
                <li>Ime i prezime</li>
                <li>Email adresa</li>
                <li>Podaci o plaćanju (obrađuju se preko Stripe-a)</li>
                <li>Podaci o korištenju platforme</li>
              </ul>
            </section>

            <section className="glass-card rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">2. Korištenje Podataka</h2>
              <p className="text-white/70">
                Vaše podatke koristimo za:
              </p>
              <ul className="list-disc list-inside text-white/70 space-y-2 mt-4">
                <li>Pružanje pristupa kursevima i sadržaju</li>
                <li>Obradu plaćanja i pretplata</li>
                <li>Komunikaciju vezanu za vaš račun</li>
                <li>Poboljšanje naših usluga</li>
              </ul>
            </section>

            <section className="glass-card rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">3. Sigurnost Podataka</h2>
              <p className="text-white/70">
                Primjenjujemo industrijske standarde za zaštitu vaših podataka, uključujući 
                enkripciju i sigurne servere. Podaci o plaćanju nikada se ne čuvaju na 
                našim serverima - sva plaćanja obrađuje Stripe.
              </p>
            </section>

            <section className="glass-card rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">4. Dijeljenje Podataka</h2>
              <p className="text-white/70">
                Ne prodajemo niti dijelimo vaše lične podatke s trećim stranama, osim 
                u sljedećim slučajevima:
              </p>
              <ul className="list-disc list-inside text-white/70 space-y-2 mt-4">
                <li>Stripe za obradu plaćanja</li>
                <li>Kada to zahtijeva zakon</li>
              </ul>
            </section>

            <section className="glass-card rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">5. Vaša Prava</h2>
              <p className="text-white/70">
                Imate pravo da:
              </p>
              <ul className="list-disc list-inside text-white/70 space-y-2 mt-4">
                <li>Pristupite svojim podacima</li>
                <li>Ispravite netačne podatke</li>
                <li>Zatražite brisanje podataka</li>
                <li>Povučete saglasnost za obradu</li>
              </ul>
            </section>

            <section className="glass-card rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">6. Kontakt</h2>
              <p className="text-white/70">
                Za sva pitanja vezana za privatnost, kontaktirajte nas na:{' '}
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
