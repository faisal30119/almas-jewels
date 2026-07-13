import { motion } from 'motion/react';
import { ArrowRight, CheckCircle, Gem, Play, Shield, Star, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import heroBrideImg from '../assets/images/hero_bride_1783594960993.jpg';
import royalCollectionImg from '../assets/images/collection_royal_1783594977165.jpg';
import solitaireCollectionImg from '../assets/images/collection_solitaire_1783594992085.jpg';
import occasionCollectionImg from '../assets/images/collection_occasion_1783595002665.jpg';
import videoThumbnailImg from '../assets/images/video_thumbnail_1783595014567.jpg';

export default function Home() {
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative h-[90vh] md:h-screen w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-emerald-950/60 z-10 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/40 via-transparent to-emerald-950/80 z-10" />
          <img 
            src={heroBrideImg} 
            alt="Elegant Bride wearing Almas Bridal Jewelry" 
            className="w-full h-full object-cover object-center"
          />
        </div>

        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto mt-20">
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-gold-400 font-medium tracking-[0.2em] uppercase text-sm md:text-base mb-6"
          >
            Exquisite Stone Bridal Sets
          </motion.p>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-4xl md:text-6xl lg:text-7xl font-serif text-white mb-8 leading-tight drop-shadow-lg"
          >
            Timeless Elegance for Your <span className="italic font-light">Most Memorable</span> Day
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-white/90 text-base md:text-xl font-light mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            Handcrafted, premium artificial jewelry designed to make you shine without compromise.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <Link 
              to="/shop"
              className="bg-gold-500 hover:bg-gold-400 text-emerald-950 px-8 py-4 md:px-10 md:py-5 rounded-none font-medium tracking-wide transition-all duration-300 inline-flex items-center gap-3 group"
            >
              Explore the Collection
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-24 px-6 md:px-12 lg:px-24 bg-white">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-20"
        >
          <motion.div variants={fadeInUp} className="text-center group">
            <div className="w-16 h-16 mx-auto border border-gold-500 rounded-full flex items-center justify-center mb-6 group-hover:bg-gold-500 transition-colors duration-500">
              <Gem className="w-6 h-6 text-gold-500 group-hover:text-white transition-colors duration-500" />
            </div>
            <h3 className="text-xl font-serif font-semibold mb-4 text-emerald-950">Unmatched Craftsmanship</h3>
            <p className="text-gray-600 font-light leading-relaxed">
              Premium stones and durable plating that look identically brilliant to real gold and diamonds.
            </p>
          </motion.div>
          <motion.div variants={fadeInUp} className="text-center group">
            <div className="w-16 h-16 mx-auto border border-gold-500 rounded-full flex items-center justify-center mb-6 group-hover:bg-gold-500 transition-colors duration-500">
              <CheckCircle className="w-6 h-6 text-gold-500 group-hover:text-white transition-colors duration-500" />
            </div>
            <h3 className="text-xl font-serif font-semibold mb-4 text-emerald-950">Tailored for Brides</h3>
            <p className="text-gray-600 font-light leading-relaxed">
              Complete matching sets including grand neckpieces, earrings, maang tikkas, and bangles.
            </p>
          </motion.div>
          <motion.div variants={fadeInUp} className="text-center group">
            <div className="w-16 h-16 mx-auto border border-gold-500 rounded-full flex items-center justify-center mb-6 group-hover:bg-gold-500 transition-colors duration-500">
              <Star className="w-6 h-6 text-gold-500 group-hover:text-white transition-colors duration-500" />
            </div>
            <h3 className="text-xl font-serif font-semibold mb-4 text-emerald-950">Luxury Within Reach</h3>
            <p className="text-gray-600 font-light leading-relaxed">
              Affordable grandeur with zero compromise on the sparkle, detail, and quality of your look.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* Shop By Category */}
      <section id="collections" className="py-24 px-6 md:px-12 lg:px-24 bg-[#F5F5F0]">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-serif text-emerald-950 mb-4">Shop By Category</h2>
            <div className="w-16 h-0.5 bg-gold-500 mx-auto"></div>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-10">
            {/* Category 1 */}
            <motion.div variants={fadeInUp} className="group bg-white cursor-pointer relative overflow-hidden aspect-[3/4]">
              <Link to="/shop?category=Bridal%20Sets" className="block w-full h-full">
                <div className="absolute inset-0 bg-emerald-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
                <img src={royalCollectionImg} alt="Bridal Sets" className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute bottom-0 left-0 right-0 p-6 z-20 bg-gradient-to-t from-emerald-950/80 to-transparent">
                  <h3 className="text-xl font-serif text-white mb-1">Bridal Sets</h3>
                  <p className="text-sm text-gold-400 uppercase tracking-widest">Shop Now</p>
                </div>
              </Link>
            </motion.div>
            {/* Category 2 */}
            <motion.div variants={fadeInUp} className="group bg-white cursor-pointer relative overflow-hidden aspect-[3/4]">
              <Link to="/shop?category=Necklaces" className="block w-full h-full">
                <div className="absolute inset-0 bg-emerald-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
                <img src={occasionCollectionImg} alt="Necklaces" className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute bottom-0 left-0 right-0 p-6 z-20 bg-gradient-to-t from-emerald-950/80 to-transparent">
                  <h3 className="text-xl font-serif text-white mb-1">Necklaces</h3>
                  <p className="text-sm text-gold-400 uppercase tracking-widest">Shop Now</p>
                </div>
              </Link>
            </motion.div>
            {/* Category 3 */}
            <motion.div variants={fadeInUp} className="group bg-white cursor-pointer relative overflow-hidden aspect-[3/4]">
              <Link to="/shop?category=Earrings" className="block w-full h-full">
                <div className="absolute inset-0 bg-emerald-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
                <img src={solitaireCollectionImg} alt="Earrings" className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute bottom-0 left-0 right-0 p-6 z-20 bg-gradient-to-t from-emerald-950/80 to-transparent">
                  <h3 className="text-xl font-serif text-white mb-1">Earrings</h3>
                  <p className="text-sm text-gold-400 uppercase tracking-widest">Shop Now</p>
                </div>
              </Link>
            </motion.div>
            {/* Category 4 */}
            <motion.div variants={fadeInUp} className="group bg-white cursor-pointer relative overflow-hidden aspect-[3/4]">
              <Link to="/shop" className="block w-full h-full">
                <div className="absolute inset-0 bg-emerald-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
                <img src={videoThumbnailImg} alt="All Products" className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute bottom-0 left-0 right-0 p-6 z-20 bg-gradient-to-t from-emerald-950/80 to-transparent">
                  <h3 className="text-xl font-serif text-white mb-1">All Products</h3>
                  <p className="text-sm text-gold-400 uppercase tracking-widest">Shop Now</p>
                </div>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Video Lookbook Placeholder */}
      <section className="bg-emerald-950 py-24 px-6 relative overflow-hidden">
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-5xl font-serif text-white mb-6">The True Brilliance</h2>
            <p className="text-white/70 font-light max-w-2xl mx-auto">Experience the captivating sparkle of our premium stones in motion.</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative aspect-video w-full bg-emerald-900 cursor-pointer group"
          >
            <img 
              src={videoThumbnailImg} 
              alt="Video Thumbnail" 
              className="w-full h-full object-cover opacity-60 group-hover:opacity-50 transition-opacity duration-500"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-500 border border-white/20">
                <Play className="w-8 h-8 text-white fill-white ml-1" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust & Social Proof */}
      <section className="py-24 px-6 md:px-12 lg:px-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center gap-8 md:gap-16 mb-20 flex-wrap">
            <div className="flex flex-col items-center gap-3 text-emerald-900/60">
              <Shield className="w-8 h-8" />
              <span className="text-xs uppercase tracking-widest font-medium">Secure Packaging</span>
            </div>
            <div className="flex flex-col items-center gap-3 text-emerald-900/60">
              <Truck className="w-8 h-8" />
              <span className="text-xs uppercase tracking-widest font-medium">Worldwide Shipping</span>
            </div>
            <div className="flex flex-col items-center gap-3 text-emerald-900/60">
              <Gem className="w-8 h-8" />
              <span className="text-xs uppercase tracking-widest font-medium">100% Quality Insured</span>
            </div>
          </div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center"
          >
            <h2 className="text-3xl font-serif text-emerald-950 mb-12">Beloved by Brides</h2>
            
            <div className="flex flex-col md:flex-row gap-8 overflow-x-auto pb-8 snap-x snap-mandatory hide-scrollbar">
              {/* Testimonials */}
              <div className="min-w-[300px] md:min-w-[400px] flex-1 bg-[#F5F5F0] p-10 text-left snap-center">
                <div className="flex text-gold-500 mb-6">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                </div>
                <p className="text-gray-600 font-light italic mb-6 leading-relaxed">
                  "I wore the Royal Heritage set for my main day. Everyone thought it was real polki. It was surprisingly comfortable and photographed beautifully."
                </p>
                <p className="text-sm font-semibold uppercase tracking-wider text-emerald-950">— Sarah M.</p>
              </div>
              <div className="min-w-[300px] md:min-w-[400px] flex-1 bg-[#F5F5F0] p-10 text-left snap-center">
                <div className="flex text-gold-500 mb-6">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                </div>
                <p className="text-gray-600 font-light italic mb-6 leading-relaxed">
                  "The solitaire necklace I got for my reception was stunning. The stones have a brilliance that rivals actual diamonds. Incredible craftsmanship."
                </p>
                <p className="text-sm font-semibold uppercase tracking-wider text-emerald-950">— Priya K.</p>
              </div>
              <div className="min-w-[300px] md:min-w-[400px] flex-1 bg-[#F5F5F0] p-10 text-left snap-center">
                <div className="flex text-gold-500 mb-6">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                </div>
                <p className="text-gray-600 font-light italic mb-6 leading-relaxed">
                  "I was skeptical about artificial jewelry but Almas changed my mind. The weight, the finish, the gold tone—it's absolute luxury."
                </p>
                <p className="text-sm font-semibold uppercase tracking-wider text-emerald-950">— Fatima A.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
