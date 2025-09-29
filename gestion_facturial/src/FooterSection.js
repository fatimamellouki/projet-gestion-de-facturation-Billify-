import { motion } from "framer-motion";
import logo from './images/logo.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faPhone, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import { faFacebookF, faTwitter, faLinkedinIn, faInstagram } from '@fortawesome/free-brands-svg-icons';

const FooterSection = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-gray-900 to-blue-900 text-white pt-16 pb-8 px-4 flex flex-col " style={{paddingTop:"35px"}}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Section Brand */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="footer-brand"
          >
            <div className="flex items-center mb-6">
              <img 
                src={logo} 
                alt="Billify Logo" 
                className="h-10 mr-3"
              />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                Billify
              </span>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Billify simplifie votre gestion financière avec des outils puissants et intuitifs.
            </p>
            <div className="flex space-x-4">
              {[faFacebookF, faTwitter, faLinkedinIn, faInstagram].map((icon, index) => (
                <motion.a
                  key={index}
                  href="#"
                  className="bg-blue-800 hover:bg-blue-700 w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300"
                  whileHover={{ y: -3 }}
                  aria-label={`Social icon ${index}`}
                >
                  <FontAwesomeIcon icon={icon} className="text-white text-lg" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Section Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="footer-contact"
          >
            <h3 className="text-xl font-semibold mb-6 text-white">Contactez-nous</h3>
            <ul className="space-y-4">
              {[
                { icon: faEnvelope, text: 'contact@billify.com' },
                { icon: faPhone, text: '+212 6 02 04 39 92' },
                { icon: faMapMarkerAlt, text: '2eme étage N°: 7, en face du café Marbella palace saada, Bureaux Rayane, Av St Louis, Fès' }
              ].map((item, index) => (
                <li key={index} className="flex items-start">
                  <FontAwesomeIcon 
                    icon={item.icon} 
                    className="mt-1 mr-4 text-blue-400 flex-shrink-0" 
                  />
                  <span className="text-gray-300 hover:text-white transition-colors">
                    {item.text}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Section Links */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="footer-links"
          >
            <h3 className="text-xl font-semibold mb-6 text-white">Liens utiles</h3>
            <ul className="space-y-3">
              <li >
                  <a 
                    href="/" 
                    className="text-gray-300 hover:text-white transition-colors flex items-center group"
                  >
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    Accueil
                  </a>
                </li>
                <li>
                  <a 
                    href="/services" 
                    className="text-gray-300 hover:text-white transition-colors flex items-center group"
                  >
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    Fonctionnalités
                  </a>
                </li>
                <li >
                  <a 
                    href="/pricing" 
                    className="text-gray-300 hover:text-white transition-colors flex items-center group"
                  >
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                   Tarifs
                  </a>
                </li>
                <li >
                  <a 
                    href="/DemandeAcces" 
                    className="text-gray-300 hover:text-white transition-colors flex items-center group"
                  >
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    Demande d'acces
                  </a>
                </li>
            </ul>
          </motion.div>
        </div>
        {/* Footer bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm"
        >
          <p>&copy; {currentYear} Billify. Tous droits réservés.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            {['Mentions légales', 'Confidentialité', 'CGU'].map((item, index) => (
              <a 
                key={index} 
                href="#" 
                className="hover:text-white transition-colors"
              >
                {item}
              </a>
            ))}
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default FooterSection;