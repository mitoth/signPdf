import React, { ReactElement } from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

const Footer = (): ReactElement => (
    <footer className="footer">
        <Stack direction="row" justifyContent="center" alignItems="center" spacing={2}>
            <Button variant="contained" size="small">
                Contact
            </Button>
            <Button variant="contained" size="small">
                Terms & Conditions
            </Button>
        </Stack>
    </footer>
);

export default Footer;
