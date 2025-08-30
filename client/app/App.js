import AppNavigator from './navigation/AppNavigator';
import { AlertProvider } from './services/alertService';

export default function App() {
	return (
		<AlertProvider>
			<AppNavigator />
		</AlertProvider>
	);
}
