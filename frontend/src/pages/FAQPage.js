import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../components/ui/accordion';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function FAQPage() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const response = await axios.get(`${API}/faq`);
        setFaqs(response.data);
      } catch (error) {
        console.error('Error fetching FAQs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFaqs();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black pt-20">
        <div className="w-16 h-16 rounded-full border-4 border-white/10 border-t-[#FF4500] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-28 pb-16" data-testid="faq-page">
      <div className="container-custom">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Česta <span className="gradient-text">Pitanja</span>
          </h1>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            Pronađite odgovore na najčešća pitanja o Continental Academy
          </p>
        </motion.div>

        {/* FAQ List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq) => (
              <AccordionItem
                key={faq.id}
                value={faq.id}
                className="glass-card rounded-xl px-6 border-none"
              >
                <AccordionTrigger className="text-left text-lg font-medium py-6 hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-white/60 pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        {/* Still have questions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mt-16"
        >
          <p className="text-white/50 mb-4">Niste pronašli odgovor?</p>
          <Link to="/contact" className="btn-gradient inline-flex">
            Kontaktirajte Nas
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
