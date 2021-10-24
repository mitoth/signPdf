import React, { ReactElement } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import './App.css';
import 'semantic-ui-css/semantic.min.css';
import FileUpload from './components/FileUpload';
import Editor from './components/Editor';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import WebFont from 'webfontloader';
import CookieConsent from 'react-cookie-consent';

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
                </Switch>
            </BrowserRouter>
            <ToastContainer position="top-center" limit={2} />
            <CookieConsent
                location="bottom"
                buttonText="I agree"
                cookieName="e-signpdfconsent"
                style={{ background: '#757ce8' }}
                buttonStyle={{ color: '#000', background: '#fff' }}
                debug={true}
                expires={150}
            >
                This website uses cookies to enhance the user experience. Please agree with the{' '}
                <u>
                    <a style={{ color: '#fff' }} href="https://www.websitepolicies.com/policies/view/4Mp9sn1Q">
                        Cookie Policy
                    </a>
                </u>{' '}
                and our{' '}
                <u>
                    <a style={{ color: '#fff' }} href="https://www.websitepolicies.com/policies/view/U7jca8sa">
                        Terms & Conditions
                    </a>
                </u>{' '}
                before using the website
            </CookieConsent>{' '}
        </div>
    );
}

export default App;
