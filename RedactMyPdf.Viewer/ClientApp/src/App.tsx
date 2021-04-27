import React, { ReactElement } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import './App.css';
import 'semantic-ui-css/semantic.min.css';

import FileUpload from './components/FileUpload';
import Editor from './components/Editor';
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
                    <Route exact path="/editor/:slug/:slug2" component={Editor} />
                </Switch>
            </BrowserRouter>
            <ToastContainer position="top-center" />
        </div>
    );
}

export default App;
