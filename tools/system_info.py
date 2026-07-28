"""
System Info Tool — CPU, RAM, disk, battery, processes, network.
"""
import platform
import time
from typing import Optional

try:
    import psutil
    PSUTIL_OK = True
except ImportError:
    PSUTIL_OK = False

WIN = platform.system() == "Windows"

def get_system_info() -> dict:
    info = {
        "platform": platform.system(),
        "hostname": platform.node(),
        "python_version": platform.python_version(),
    }
    if PSUTIL_OK:
        vm = psutil.virtual_memory()
        disk_path = "C:\\" if WIN else "/"
        info.update({
            "cpu_percent": psutil.cpu_percent(interval=1),
            "cpu_count": psutil.cpu_count(),
            "ram_total_gb": round(vm.total / 1e9, 1),
            "ram_used_gb": round(vm.used / 1e9, 1),
            "ram_percent": vm.percent,
            "disk_total_gb": round(psutil.disk_usage(disk_path).total / 1e9, 1),
            "disk_used_gb": round(psutil.disk_usage(disk_path).used / 1e9, 1),
            "disk_percent": psutil.disk_usage(disk_path).percent,
        })
        bat = psutil.sensors_battery()
        if bat:
            info["battery_percent"] = bat.percent
            info["battery_plugged"] = bat.power_plugged
    return {"success": True, "info": info}

def get_running_processes(filter_name: Optional[str] = None) -> dict:
    if not PSUTIL_OK:
        return {"success": False, "error": "psutil not available"}
    procs = []
    for p in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_percent']):
        try:
            if filter_name and filter_name.lower() not in p.info['name'].lower():
                continue
            procs.append(p.info)
        except Exception:
            pass
    procs.sort(key=lambda x: x.get('cpu_percent', 0), reverse=True)
    return {"success": True, "processes": procs[:20]}

def get_network_info() -> dict:
    if not PSUTIL_OK:
        return {"success": False, "error": "psutil not available"}
    counters = psutil.net_io_counters()
    addrs = psutil.net_if_addrs()
    interfaces = {k: [a.address for a in v if a.family == 2] for k, v in addrs.items()}
    return {
        "success": True,
        "bytes_sent_mb": round(counters.bytes_sent / 1e6, 2),
        "bytes_recv_mb": round(counters.bytes_recv / 1e6, 2),
        "interfaces": interfaces,
    }
