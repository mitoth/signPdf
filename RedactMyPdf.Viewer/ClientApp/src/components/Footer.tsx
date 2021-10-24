import React, { ReactElement } from 'react';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';

interface IProps {
    onContactPageClick: () => void;
}

const Footer = (props: IProps): ReactElement => (
    <footer className="footer">
        <Stack direction="row" justifyContent="center" alignItems="center" spacing={2}>
            <Chip label="Contact" component="a" href="" clickable onClick={props.onContactPageClick} />
            <Chip
                label="Terms & Conditions"
                component="a"
                href="https://www.websitepolicies.com/policies/view/U7jca8sa"
                clickable
            />
            <Chip
                label="Disclaimer"
                component="a"
                href="https://www.websitepolicies.com/policies/view/DE39uidA"
                clickable
            />
        </Stack>
    </footer>
);

export default Footer;
