import { motion } from 'framer-motion';
import { Target, Users, Award, Heart } from 'lucide-react';

export default function AboutPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-black pt-24 pb-16" data-testid="about-page">
      <div className="container-custom">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            O <span className="gradient-text">Nama</span>
          </h1>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            Upoznajte tim koji stoji iza Continental Academy
          </p>
        </motion.div>

        {/* Mission */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-8 md:p-12 mb-16"
        >
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">Naša Misija</h2>
            <p className="text-white/70 text-lg leading-relaxed">
              Continental Academy je osnovana sa jednim ciljem - pomoći mladim ljudima da ostvare 
              finansijsku slobodu kroz online poslovanje. Vjerujemo da svako zaslužuje priliku 
              da nauči vještine koje će promijeniti njihov život, bez obzira na početnu situaciju.
            </p>
          </div>
        </motion.div>

        {/* Values */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          {[
            { icon: Target, title: 'Fokus', desc: 'Usmjereni smo na rezultate, ne na teoriju' },
            { icon: Users, title: 'Zajednica', desc: 'Snaga je u zajedničkom rastu i podršci' },
            { icon: Award, title: 'Kvalitet', desc: 'Pružamo samo provjerene i testirane metode' },
            { icon: Heart, title: 'Posvećenost', desc: 'Tu smo za vas 24/7, u svakom koraku' },
          ].map((value, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="glass-card rounded-xl p-6 text-center"
            >
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl gradient-bg flex items-center justify-center">
                <value.icon size={24} />
              </div>
              <h3 className="text-lg font-semibold mb-2">{value.title}</h3>
              <p className="text-white/50 text-sm">{value.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Story */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center">Naša Priča</h2>
          <div className="space-y-6 text-white/70 leading-relaxed">
            <p>
              Continental Academy je nastala iz potrebe da se kvalitetno online obrazovanje 
              učini dostupnim svima na prostorima Balkana. Osnivači su prošli put od nule 
              do uspješnog online poslovanja i željeli su podijeliti to znanje sa drugima.
            </p>
            <p>
              Danas, sa preko 1500 članova i desetinama uspješnih priča, Continental Academy 
              predstavlja vodeću platformu za učenje online zarade na bosanskom jeziku. 
              Naši kursevi pokrivaju sve - od osnova do naprednih strategija.
            </p>
            <p>
              Ali više od kurseva, mi smo zajednica. Discord server sa aktivnom podrškom, 
              redovni webinari, i pristup mentorima čine nas posebnima. Vaš uspjeh je naš uspjeh.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
