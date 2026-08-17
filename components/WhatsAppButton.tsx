'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';

const WHATSAPP_NUMBER = '919608921088';
const DEFAULT_MESSAGE = 'Hello! I am interested in your jewelry collection. Could you please help me?';

export default function WhatsAppButton() {
  const [tooltip, setTooltip] = useState(false);
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;

  return (
    <>
      <style>{`
        @keyframes wa-glow {
          0%   { box-shadow: 0 0 0 0 rgba(37,211,102,0.55); }
          70%  { box-shadow: 0 0 0 14px rgba(37,211,102,0); }
          100% { box-shadow: 0 0 0 0 rgba(37,211,102,0); }
        }
        .wa-glow {
          animation: wa-glow 2s ease-out 3;
        }
      `}</style>

      <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-3">

        {/* Tooltip bubble */}
        {tooltip && (
          <div
            className="relative bg-white border border-gray-100 shadow-xl px-4 py-4 max-w-[220px]"
            style={{ borderRadius: 0 }}
          >
            <button
              onClick={() => setTooltip(false)}
              className="absolute top-2 right-2 text-gray-300 hover:text-gray-500 transition-colors"
              aria-label="Close"
            >
              <X size={13} />
            </button>

            {/* Brand header */}
            <div className="bg-[#25D366] -mx-4 -mt-4 px-4 py-3 mb-3 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="18" height="18" fill="white">
                <path d="M16.003 2.667C8.64 2.667 2.667 8.64 2.667 16c0 2.347.64 4.64 1.853 6.64L2.667 29.333l6.88-1.813A13.28 13.28 0 0 0 16.003 29.333c7.36 0 13.333-5.973 13.333-13.333S23.363 2.667 16.003 2.667zm0 24c-2.107 0-4.16-.56-5.947-1.627l-.427-.253-4.08 1.067 1.093-3.973-.28-.44A10.613 10.613 0 0 1 5.333 16c0-5.867 4.8-10.667 10.667-10.667S26.667 10.133 26.667 16 21.867 26.667 16.003 26.667zm5.84-7.973c-.32-.16-1.893-.933-2.187-1.04-.293-.107-.507-.16-.72.16-.213.32-.827 1.04-.987 1.227-.16.187-.32.213-.64.053-.32-.16-1.347-.493-2.56-1.573-.947-.84-1.587-1.88-1.773-2.2-.187-.32-.02-.493.14-.653.147-.147.32-.373.48-.56.16-.187.213-.32.32-.533.107-.213.053-.4-.027-.56-.08-.16-.72-1.733-.987-2.373-.267-.627-.533-.533-.72-.547h-.613c-.213 0-.56.08-.853.373-.293.293-1.12 1.093-1.12 2.667s1.147 3.093 1.307 3.307c.16.213 2.253 3.44 5.467 4.827.76.32 1.36.507 1.827.653.76.24 1.453.2 2 .12.613-.093 1.893-.773 2.16-1.52.267-.747.267-1.387.187-1.52-.08-.133-.293-.213-.613-.373z"/>
              </svg>
              <div>
                <p className="font-sans text-xs font-semibold text-white leading-tight">Almas Jewels</p>
                <p className="font-sans text-[10px] text-white/80 leading-tight">Typically replies instantly</p>
              </div>
            </div>

            <p className="font-sans text-xs text-gray-500 leading-relaxed pr-2">
              Have a question? Chat with us on WhatsApp.
            </p>

            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 mt-3 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-sans text-xs uppercase tracking-widest px-4 py-2.5 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="13" height="13" fill="white">
                <path d="M16.003 2.667C8.64 2.667 2.667 8.64 2.667 16c0 2.347.64 4.64 1.853 6.64L2.667 29.333l6.88-1.813A13.28 13.28 0 0 0 16.003 29.333c7.36 0 13.333-5.973 13.333-13.333S23.363 2.667 16.003 2.667zm0 24c-2.107 0-4.16-.56-5.947-1.627l-.427-.253-4.08 1.067 1.093-3.973-.28-.44A10.613 10.613 0 0 1 5.333 16c0-5.867 4.8-10.667 10.667-10.667S26.667 10.133 26.667 16 21.867 26.667 16.003 26.667zm5.84-7.973c-.32-.16-1.893-.933-2.187-1.04-.293-.107-.507-.16-.72.16-.213.32-.827 1.04-.987 1.227-.16.187-.32.213-.64.053-.32-.16-1.347-.493-2.56-1.573-.947-.84-1.587-1.88-1.773-2.2-.187-.32-.02-.493.14-.653.147-.147.32-.373.48-.56.16-.187.213-.32.32-.533.107-.213.053-.4-.027-.56-.08-.16-.72-1.733-.987-2.373-.267-.627-.533-.533-.72-.547h-.613c-.213 0-.56.08-.853.373-.293.293-1.12 1.093-1.12 2.667s1.147 3.093 1.307 3.307c.16.213 2.253 3.44 5.467 4.827.76.32 1.36.507 1.827.653.76.24 1.453.2 2 .12.613-.093 1.893-.773 2.16-1.52.267-.747.267-1.387.187-1.52-.08-.133-.293-.213-.613-.373z"/>
              </svg>
              Start Chat
            </a>

            {/* Arrow */}
            <div className="absolute -bottom-2 right-6 w-3 h-3 bg-white border-r border-b border-gray-100 rotate-45" />
          </div>
        )}

        {/* FAB — green circle with white WhatsApp logo + glow on load */}
        <button
          onClick={() => setTooltip((v) => !v)}
          aria-label="Chat on WhatsApp"
          className="wa-glow w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#1ebe5d] active:scale-95 transition-all flex items-center justify-center shadow-lg"
        >
          {tooltip ? (
            <X size={22} className="text-white" />
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 32 32"
              width="30"
              height="30"
              fill="white"
              aria-hidden="true"
            >
              <path d="M16.003 2.667C8.64 2.667 2.667 8.64 2.667 16c0 2.347.64 4.64 1.853 6.64L2.667 29.333l6.88-1.813A13.28 13.28 0 0 0 16.003 29.333c7.36 0 13.333-5.973 13.333-13.333S23.363 2.667 16.003 2.667zm0 24c-2.107 0-4.16-.56-5.947-1.627l-.427-.253-4.08 1.067 1.093-3.973-.28-.44A10.613 10.613 0 0 1 5.333 16c0-5.867 4.8-10.667 10.667-10.667S26.667 10.133 26.667 16 21.867 26.667 16.003 26.667zm5.84-7.973c-.32-.16-1.893-.933-2.187-1.04-.293-.107-.507-.16-.72.16-.213.32-.827 1.04-.987 1.227-.16.187-.32.213-.64.053-.32-.16-1.347-.493-2.56-1.573-.947-.84-1.587-1.88-1.773-2.2-.187-.32-.02-.493.14-.653.147-.147.32-.373.48-.56.16-.187.213-.32.32-.533.107-.213.053-.4-.027-.56-.08-.16-.72-1.733-.987-2.373-.267-.627-.533-.533-.72-.547h-.613c-.213 0-.56.08-.853.373-.293.293-1.12 1.093-1.12 2.667s1.147 3.093 1.307 3.307c.16.213 2.253 3.44 5.467 4.827.76.32 1.36.507 1.827.653.76.24 1.453.2 2 .12.613-.093 1.893-.773 2.16-1.52.267-.747.267-1.387.187-1.52-.08-.133-.293-.213-.613-.373z" />
            </svg>
          )}
        </button>

      </div>
    </>
  );
}
