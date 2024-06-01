import { PreviewFrame } from "../components/PreviewFrame";
import { devURL } from "../global";

export function Preview() {
	return <PreviewFrame url={devURL} />;
}
