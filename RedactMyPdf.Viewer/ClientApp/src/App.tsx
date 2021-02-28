import React, { ReactElement } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import './App.css';
import 'semantic-ui-css/semantic.min.css';

import FileUpload from './components/FileUpload';
import Editor from './components/Editor';

function App(): ReactElement {
    return (
        <div>
            <BrowserRouter>
                <Switch>
                    <Route exact path="/" component={FileUpload} />
                    <Route exact path="/editor/:slug/:slug2" component={Editor} />
                </Switch>
            </BrowserRouter>
        </div>
    );
}

export default App;
