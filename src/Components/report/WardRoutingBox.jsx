import React from 'react';

/**
 * Live preview of the identified Local Ward and responsible Department
 */
export function WardRoutingBox({ routingPreview }) {
  if (!routingPreview) return null;

  return (
    <div className="mt-3 p-3.5 rounded-xl bg-slate-950/80 border border-cyan-500/30">
      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-2">🏘️ GIS Ward Identification</p>
      <div className="grid grid-cols-1 gap-1.5 text-xs">
        {routingPreview.ward && (
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Local Ward:</span>
            <span className="text-cyan-300 font-bold">{routingPreview.ward || routingPreview.jurisdiction?.ward}</span>
          </div>
        )}
        {routingPreview.jurisdiction?.type && (
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Jurisdiction:</span>
            <span className="text-emerald-400 font-semibold">{routingPreview.jurisdiction.type}</span>
          </div>
        )}
        {routingPreview.departmentType && (
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Department:</span>
            <span className="text-purple-300 font-semibold">{routingPreview.departmentType}</span>
          </div>
        )}
        {routingPreview.responsibleAuthority && (
          <div className="mt-1 pt-1.5 border-t border-slate-800">
            <span className="text-slate-400 block mb-0.5">Routed to:</span>
            <span className="text-blue-300 font-bold leading-tight">
              🏛️ {routingPreview.responsibleAuthority}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default WardRoutingBox;
