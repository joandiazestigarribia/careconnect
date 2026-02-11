import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'María G.',
    role: 'Mamá de 2 niños',
    location: 'Resistencia, Chaco',
    content: 'Hermosa y segura manera de encontrar niñeras. CareConnect hizo más fácil el día a día de nuestra familia. ¡La recomiendo totalmente!',
    rating: 5,
    avatar: 'M',
  },
  {
    name: 'Lucas R.',
    role: 'Cuidador',
    location: 'Resistencia, Chaco',
    content: 'Es una aplicación fantástica y segura. He tenido muy buenas experiencias trabajando con familias y niños muy cariñosos.',
    rating: 5,
    avatar: 'L',
  },
  {
    name: 'Ana P.',
    role: 'Mamá primeriza',
    location: 'Barranqueras, Chaco',
    content: 'La app es súper fácil de usar y confiable. Tiene muchos sistemas de seguridad que te hacen sentir tranquila al dejar a tu bebé.',
    rating: 5,
    avatar: 'A',
  },
];

const TestimonialsSection = () => {
  return (
    <section id="testimonios" className="py-24 bg-bg-main">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 bg-accent/10 text-accent-dark text-sm font-medium rounded-full mb-4">
            Testimonios
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
            Lo que dicen nuestros usuarios
          </h2>
          <p className="text-lg text-text-secondary">
            Miles de familias y cuidadores ya confían en CareConnect
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.name}
              className="relative bg-white rounded-2xl p-8 shadow-sm border border-border hover:shadow-lg transition-all"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Quote icon */}
              <div className="absolute -top-4 left-8 w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Quote className="w-4 h-4 text-white" />
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-accent fill-accent" />
                ))}
              </div>

              {/* Content */}
              <p className="text-text-secondary mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-lg font-bold text-primary">
                    {testimonial.avatar}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-text-primary">
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
          <div className="inline-flex items-center gap-6 px-8 py-4 bg-white rounded-2xl shadow-sm border border-border">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-3">
                {['M', 'L', 'A', 'J'].map((letter, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 bg-primary/20 rounded-full border-2 border-white flex items-center justify-center text-sm font-bold text-primary"
                  >
                    {letter}
                  </div>
                ))}
              </div>
            </div>
            <div className="text-left">
              <p className="font-semibold text-text-primary">
                +500 usuarios satisfechos
              </p>
              <p className="text-sm text-text-secondary">
                Únete a nuestra comunidad
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
