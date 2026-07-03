"use server";

import * as fleetService from "../services/fleet";

export async function getRoutesAction() {
  try {
    const data = await fleetService.getRoutes();
    return { success: true, data };
  } catch (error) {
    console.error("Failed to fetch routes:", error);
    return { success: false, error: "Failed to fetch routes" };
  }
}

export async function getVehiclesAction() {
  try {
    const data = await fleetService.getVehicles();
    return { success: true, data };
  } catch (error) {
    console.error("Failed to fetch vehicles:", error);
    return { success: false, error: "Failed to fetch vehicles" };
  }
}

export async function getDriversAction() {
  try {
    const data = await fleetService.getDrivers();
    return { success: true, data };
  } catch (error) {
    console.error("Failed to fetch drivers:", error);
    return { success: false, error: "Failed to fetch drivers" };
  }
}

export async function getAssignmentsByDateAction(dateStr: string) {
  try {
    const data = await fleetService.getAssignmentsByDate(dateStr);
    return { success: true, data };
  } catch (error) {
    console.error(`Failed to fetch assignments for date ${dateStr}:`, error);
    return { success: false, error: "Failed to fetch assignments" };
  }
}
