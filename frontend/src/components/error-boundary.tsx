import * as React from 'react';

// 1. Определяем типы для пропсов (Props)
interface ErrorBoundaryProps {
  /** Элемент, который будет отображаться при ошибке (запасной UI). */
  fallback: React.ReactNode;
  /** Вложенные дочерние элементы, которые могут вызвать ошибку. */
  children: React.ReactNode;
}

// 2. Определяем типы для состояния (State)
interface ErrorBoundaryState {
  hasError: boolean;
}

// 3. Компонент, использующий дженерики <Props, State>
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // Дополнительный интерфейс для аргументов componentDidCatch,
  // чтобы явно определить тип componentStack, если logErrorToMyService
  // требует более строгих типов.
  // const componentStack: string | undefined = info.componentStack;
  
  constructor(props: ErrorBoundaryProps) {
    super(props);
    // 4. Инициализируем состояние с явными типами.
    this.state = { hasError: false };
  }

  // 5. static getDerivedStateFromError явно принимает 'error' типа 'any' или 'Error'
  static getDerivedStateFromError(error: any): ErrorBoundaryState {
    // Обновляем состояние, чтобы следующий рендер показал запасной UI.
    console.error('getDerivedStateFromError:', error);
    return { hasError: true };
  }

  // 6. componentDidCatch явно принимает 'error' и 'info'
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // В реальном приложении: отправка данных об ошибке на сервис логирования
    const componentStack: string | undefined | null = info.componentStack;
    
    // ПРИМЕЧАНИЕ: Функции logErrorToMyService и React.captureOwnerStack 
    // должны быть определены глобально или импортированы.
    // Если они не определены, закомментируйте этот блок или замените его на console.error.
    /* logErrorToMyService(
      error,
      componentStack,
      React.captureOwnerStack(),
    );
    */
    console.error('Uncaught error:', error, componentStack);
  }

  render() {
    if (this.state.hasError) {
      // Отображаем запасной UI, переданный через пропсы
      return this.props.fallback;
    }

    return this.props.children;
  }
}

// Пример использования (опционально, для полноты)
/*
const App = () => (
  <ErrorBoundary fallback={<h1>Что-то пошло не так.</h1>}>
    <div>
      <ComponentThatMightThrow />
    </div>
  </ErrorBoundary>
);
*/

export default ErrorBoundary;