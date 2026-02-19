import { Loader2, Search, Users, MapPin } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  subMessage?: string;
}

export const LoadingState = ({ 
  message = 'Buscando...', 
  subMessage = 'Estamos analizando las mejores opciones para ti.' 
}: LoadingStateProps) => (
  <div className="text-center py-16 bg-linear-to-br from-surface to-bg-main rounded-3xl border border-border shadow-lg">
    <div className="w-24 h-24 bg-linear-to-br from-primary/10 to-accent/10 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
      <Loader2 className="w-12 h-12 text-primary animate-spin" />
    </div>
    <h3 className="text-xl font-bold text-text-primary mb-2">
      {message}
    </h3>
    <p className="text-text-secondary">
      {subMessage}
    </p>
  </div>
);

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: 'search' | 'users';
}

export const EmptyState = ({ 
  title = 'No se encontraron resultados', 
  message = 'Intenta ampliar el radio de búsqueda o ajustar los filtros para encontrar más opciones.',
  icon = 'search'
}: EmptyStateProps) => {
  const Icon = icon === 'users' ? Users : Search;
  return (
    <div className="text-center py-16 bg-linear-to-br from-surface to-bg-main rounded-3xl border border-border shadow-lg">
      <div className="w-24 h-24 bg-linear-to-br from-text-muted/20 to-text-muted/5 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
        <Icon className="w-12 h-12 text-text-muted" />
      </div>
      <h3 className="text-xl font-bold text-text-primary mb-2">
        {title}
      </h3>
      <p className="text-text-secondary max-w-sm mx-auto">
        {message}
      </p>
    </div>
  );
};

interface InitialStateProps {
  title?: string;
  message?: string;
}

export const InitialState = ({ 
  title = '¿Listo para comenzar?', 
  message = 'Configura tu ubicación y preferencias para encontrar las mejores opciones.'
}: InitialStateProps) => (
  <div className="text-center py-16 bg-linear-to-br from-primary/5 to-accent/5 rounded-3xl border border-primary/10 shadow-lg shadow-primary/5">
    <div className="w-24 h-24 bg-linear-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
      <MapPin className="w-12 h-12 text-primary" />
    </div>
    <h3 className="text-xl font-bold text-text-primary mb-2">
      {title}
    </h3>
    <p className="text-text-secondary max-w-sm mx-auto">
      {message}
    </p>
  </div>
);

interface ErrorStateProps {
  message: string;
}

export const ErrorState = ({ message }: ErrorStateProps) => (
  <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl shadow-sm">
    <div className="w-5 h-5 text-red-500 shrink-0 mt-0.5">⚠</div>
    <p className="text-sm text-red-700">{message}</p>
  </div>
);

interface ResultsHeaderProps {
  count: number;
  radius: number;
  type?: 'caregivers' | 'families';
}

export const ResultsHeader = ({ count, radius, type = 'caregivers' }: ResultsHeaderProps) => {
  const Icon = type === 'families' ? Users : Search;
  const label = type === 'families' ? 'familias' : 'cuidadores';
  
  return (
    <div className="flex items-center justify-between bg-linear-to-r from-surface to-bg-main p-5 rounded-2xl border border-border shadow-lg shadow-primary/5">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-linear-to-br from-primary to-primary-light rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-text-primary">
            {count} {label} encontrados
          </h2>
          <p className="text-sm text-text-secondary">
            Dentro de un radio de {radius} km
          </p>
        </div>
      </div>
    </div>
  );
};
