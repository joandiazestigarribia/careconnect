import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

const CTASection = () => {
  return (
    <section className="py-24 bg-primary relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full mb-6">
          <Sparkles className="w-4 h-4 text-white" />
          <span className="text-sm font-medium text-white">
            Comenzá hoy mismo
          </span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
          Encontrá el cuidador perfecto para tu familia
        </h2>

        <p className="text-lg sm:text-xl text-white/80 mb-10 max-w-2xl mx-auto">
          Unite a cientos de familias que ya encontraron la ayuda que necesitan. 
          Registrarse es gratis y toma menos de 2 minutos.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/register"
            className="w-full sm:w-auto px-8 py-4 bg-white text-primary font-semibold rounded-xl hover:bg-white/90 transition-colors flex items-center justify-center gap-2 group"
          >
            Crear cuenta gratuita
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto px-8 py-4 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors border border-white/20"
          >
            Ya tengo una cuenta
          </Link>
        </div>

        <p className="mt-6 text-sm text-white/60">
          Sin tarjetas de crédito • Sin compromisos • Cancelá cuando quieras
        </p>
      </div>
    </section>
  );
};

export default CTASection;
