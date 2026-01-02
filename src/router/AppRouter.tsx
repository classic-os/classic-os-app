import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "@/app/AppShell";

import { Dashboard } from "@/pages/Dashboard";
import { Swap } from "@/pages/Swap";
import { LendBorrow } from "@/pages/LendBorrow";
import { Liquidity } from "@/pages/Liquidity";
import { Placeholder } from "@/pages/Placeholder";
import { RouteError } from "@/pages/RouteError";

export const router = createBrowserRouter([
    {
        element: <AppShell />,
        errorElement: <RouteError />,
        children: [
            { path: "/", element: <Dashboard /> },
            { path: "/swap", element: <Swap /> },
            { path: "/lend", element: <LendBorrow /> },
            { path: "/liquidity", element: <Liquidity /> },

            // internal placeholder page (external product still links out)
            { path: "/onramp", element: <Placeholder title="On / Off-Ramp" /> },

            // catch-all
            { path: "*", element: <Placeholder title="Not Found" /> },
        ],
    },
]);
