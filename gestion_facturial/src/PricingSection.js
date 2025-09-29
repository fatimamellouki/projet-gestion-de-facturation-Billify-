import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { FaCheck, FaCrown, FaRocket, FaBuilding } from 'react-icons/fa';
import Footer from './FooterSection';
const PricingSections = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const plans = [
    {
      name: "Démo gratuite",
      price: "0 DH",
      period: "/mois",
      features: ["5 factures par mois", "Accès basique", "Support par email", "1 utilisateur"],
      icon: <FaRocket className="text-blue-500" />,
      popular: false
    },
    {
      name: "Pro",
      price: "99 DH",
      period: "/mois",
      features: ["Facturation illimitée", "Support prioritaire", "5 utilisateurs", "Rapports avancés"],
      icon: <FaCrown className="text-amber-400" />,
      popular: true
    },
    {
      name: "Entreprise",
      price: "Sur demande",
      period: "",
      features: ["Comptes multiples", "Accès API", "Support dédié", "Personnalisation"],
      icon: <FaBuilding className="text-purple-500" />,
      popular: false
    }
  ];

  return (
    <section 
      id="pricing" 
      className=" relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800  pb-16 md:pt-20 md:pb-2"
      ref={ref}
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Nos <span className="text-blue-600 dark:text-blue-400">offres</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Choisissez le plan qui correspond à vos besoins
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end"
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          variants={{
            hidden: {},
            show: {
              transition: {
                staggerChildren: 0.2
              }
            }
          }}
        >
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              className={`relative rounded-xl shadow-lg overflow-hidden transition-all duration-300 ${
                plan.popular 
                  ? "border-2 border-blue-500 dark:border-blue-400 transform md:scale-105 z-10" 
                  : "border border-gray-200 dark:border-gray-700"
              }`}
              variants={{
                hidden: { opacity: 0, y: 30 },
                show: { 
                  opacity: 1, 
                  y: 0,
                  transition: {
                    type: "spring",
                    damping: 15
                  }
                }
              }}
              whileHover={{ y: -10 }}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-bl-lg">
                  POPULAIRE
                </div>
              )}
              
              <div className={`p-8 ${
                plan.popular 
                  ? "bg-white dark:bg-gray-800" 
                  : "bg-white/80 dark:bg-gray-800/80"
              }`}>
                <div className="flex items-center mb-6">
                  <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/50 mr-4">
                    {plan.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {plan.name}
                  </h3>
                </div>
                
                <div className="mb-8">
                  <p className="text-4xl font-bold text-gray-900 dark:text-white">
                    {plan.price}
                    {plan.period && (
                      <span className="text-lg text-gray-500 dark:text-gray-400">
                        {plan.period}
                      </span>
                    )}
                  </p>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center">
                      <FaCheck className="text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-300">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                
                <button
                  className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                    plan.popular
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                      : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white"
                  }`}
                >
                  {plan.popular ? "Commencer maintenant" : "Essayer gratuitement"}
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default  function PricingSection(){
  return (
    <div>
      <PricingSections />
      {/* <Footer /> */}
    </div>
  );
}