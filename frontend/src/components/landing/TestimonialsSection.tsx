import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'María G.',
    role: 'Mamá de 2 niños',
    location: 'Resistencia, Chaco',
    content: 'El sistema de scoring es GENIAL. Encontré a Lucía que tiene un 96% de match con mi familia. ¡Mis hijos la adoran! 🥰',
    rating: 5,
    perfil: 'https://i.pravatar.cc/150?img=5',
    highlight: 'Match del 96%',
  },
  {
    name: 'Lucas R.',
    role: 'Cuidador',
    location: 'Resistencia, Chaco',
    content: 'Como cuidador, me encanta cómo funciona el trust score. A más reseñas positivas, más familias me contactan. ¡Ya tengo trabajo estable!',
    rating: 5,
    perfil: 'https://i.pravatar.cc/150?img=12',
    highlight: 'Trust Score alto',
  },
  {
    name: 'Ana P.',
    role: 'Mamá primeriza',
    location: 'Barranqueras, Chaco',
    content: 'Como mamá primeriza estaba muy nerviosa. Poder ver el puntaje de match y las reseñas me dio mucha confianza. ¡100% recomendado!',
    rating: 5,
    perfil: 'https://i.pravatar.cc/150?img=35',
    highlight: 'Mamá primeriza',
  },
];

const TestimonialsSection = () => {
  return (
    <section id="testimonios" className="py-24 bg-bg-main relative overflow-hidden">

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md mb-6">
            <span className="text-sm font-bold text-text-primary">
              Lo que dicen nuestros usuarios
            </span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-text-primary mb-4">
            Historias reales,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-primary">
              familias felices
            </span>
          </h2>
          
          <p className="text-lg text-text-secondary">
            Miles de familias y cuidadores ya confían en CareConnect
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="relative bg-white rounded-3xl p-8 shadow-lg border-2 border-transparent hover:border-accent/30 transition-all group"
            >
              {/* Quote icon */}
              <div className="absolute -top-4 left-8 w-10 h-10 bg-gradient-to-br from-accent to-accent-dark rounded-xl flex items-center justify-center shadow-lg">
                <Quote className="w-5 h-5 text-white" />
              </div>

              {/* Highlight badge */}
              <div className="absolute top-6 right-6">
                <span className="px-3 py-1 bg-accent/10 text-accent-dark text-xs font-bold rounded-full">
                  {testimonial.highlight}
                </span>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1 mb-4 mt-2">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-warning fill-warning" />
                ))}
              </div>

              {/* Content */}
              <p className="text-text-secondary mb-6 leading-relaxed text-lg">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <img 
                  src={testimonial.perfil} 
                  alt={testimonial.name}
                  className="w-14 h-14 rounded-full shadow-md object-cover"
                />
                <div>
                  <p className="font-bold text-text-primary">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-text-secondary">
                    {testimonial.role} • {testimonial.location}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust indicator */}
        <div className="mt-16 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 px-8 py-6 bg-white rounded-3xl shadow-xl">
            <div className="text-left">
              <p className="font-bold text-text-primary text-lg">
                +500 usuarios satisfechos
              </p>
              <p className="text-text-secondary">
                Sumate a nuestra comunidad!
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
