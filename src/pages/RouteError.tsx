import { useRouteError } from "react-router-dom";

export function RouteError() {
    const err = useRouteError();
    console.error(err);

    return (
        <div>
            <h1>Something went wrong</h1>
            <p>Check the console for details.</p>
        </div>
    );
}
