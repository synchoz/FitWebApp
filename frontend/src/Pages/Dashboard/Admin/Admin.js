import React from "react";
import AdminWeightLogs from "./components/AdminWeightLogs";
import AdminExerciseLogs from "./components/AdminExerciseLogs";
import AdminFoodCatalog from "./components/AdminFoodCatalog";
import AdminExerciseCatalog from "./components/AdminExerciseCatalog";

export default function Admin() {
    return (
        <div className="flex flex-col ml-14 md:ml-[220px] px-4 sm:px-6 py-6 gap-6 bg-gray-50 min-h-screen">
            <div className="text-2xl font-semibold text-gray-800">Admin</div>

            <div className="text-lg font-semibold text-gray-800 -mb-3">Weight Logs</div>
            <AdminWeightLogs />

            <div className="text-lg font-semibold text-gray-800 -mb-3">Exercise Logs</div>
            <AdminExerciseLogs />

            <div className="text-lg font-semibold text-gray-800 -mb-3">Food Catalog</div>
            <AdminFoodCatalog />

            <div className="text-lg font-semibold text-gray-800 -mb-3">Exercise Catalog</div>
            <AdminExerciseCatalog />
        </div>
    );
}
