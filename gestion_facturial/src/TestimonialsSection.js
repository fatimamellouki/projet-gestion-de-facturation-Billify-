import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { FaQuoteLeft, FaStar } from 'react-icons/fa';
import client1 from './images/youssef.jpeg';
import client2 from './images/salma.jpeg';
import client3 from './images/Mehdi.jpeg';

const TestimonialsSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const testimonials = [
    {
      id: 1,
      name: "Youssef A.",
      role: "Freelance développeur",
      content: "Billify m'a permis de gagner un temps fou. Interface claire et service impeccable.",
      rating: 5,
      image: client1
    },
    {
      id: 2,
      name: "Salma K.",
      role: "Graphiste",
      content: "La gestion des clients et les relances automatiques me facilitent la vie au quotidien.",
      rating: 5,
      image: client2
    },
    {
      id: 3,
      name: "Mehdi T.",
      role: "Consultant",
      content: "Simple, efficace, et un support client très réactif. Je recommande sans hésitation.",
      rating: 4,
      image: client3
    }
  ];

  return (
    <section id="testimonials" className=" relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 pt-24 pb-16 md:pt-10 md:pb-2">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Témoignages de <span className="text-blue-600 dark:text-blue-400">nos clients</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Découvrez ce que nos clients disent de leur expérience avec Billify
          </p>
        </motion.div>

        <motion.div
          ref={ref}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
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
          {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300"
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
              whileHover={{ y: -5 }}
            >
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 mr-4">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name} 
                    className="w-12 h-12 rounded-full object-cover border-2 border-blue-100 dark:border-blue-900"
                  />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {testimonial.name}
                  </h4>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {testimonial.role}
                  </p>
                </div>
              </div>
              
              <div className="mb-4 text-gray-600 dark:text-gray-300 relative">
                <FaQuoteLeft className="text-blue-200 dark:text-blue-900 text-2xl absolute -top-2 -left-1" />
                <p className="pl-6 italic">"{testimonial.content}"</p>
              </div>
              
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <FaStar 
                    key={i} 
                    className={`text-lg ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} 
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;