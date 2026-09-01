import React from 'react';
import { Shield, Lock } from 'lucide-react';

interface FooterProps {
  caseId: string;
}

export const Footer: React.FC<FooterProps> = ({ caseId }) => {
  return (
    <footer
      id="app-footer"
      className="w-full mt-12 border-t border-[#E5E5E5] bg-white py-4 text-xs"
    >
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[#888888]">
        <div className="flex items-center gap-2 text-left">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#051C2C]">
            LANDED COST BENCHMARK • {caseId}
          </span>
        </div>

        <div className="text-[11px] text-right">
          Storage for this tool is entirely local via localStorage. No user data is retained on external servers.
        </div>
      </div>
    </footer>
  );
};
