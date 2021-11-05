import DrawLine from './DrawLine';

interface Signature {
    x?: number;
    y?: number;
    id?: string;
    width?: number;
    height?: number;
    lines?: DrawLine[];
}

export default Signature;
