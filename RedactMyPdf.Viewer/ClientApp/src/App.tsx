import React, { ReactElement } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import './App.css';
import FileUpload from './components/FileUpload';
import Editor from './components/Editor';
import ContactPage from './components/ContactPage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import WebFont from 'webfontloader';

function App(): ReactElement {
    React.useEffect(() => {
        WebFont.load({
            google: {
                families: ['Great Vibes'],
            },
        });
    }, []);

    return (
        <div>
            <BrowserRouter>
                <Switch>
                    <Route exact path="/" component={FileUpload} />
                    <Route exact path="/editor" component={Editor} />
                    <Route exact path="/contact" component={ContactPage} />
                </Switch>
            </BrowserRouter>
            <ToastContainer position="top-center" limit={2} />
        </div>
    );
}

export default App;
