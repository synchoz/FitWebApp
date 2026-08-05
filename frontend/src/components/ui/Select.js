import React, { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/24/outline';

function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
}

export default function Select({
    value,
    onChange,
    placeholder = 'Select...',
    displayLabel,
    warning = false,
    disabled = false,
    className = '',
    children,
}) {
    const label = displayLabel !== undefined ? displayLabel : value;
    return (
        <Listbox value={value} onChange={onChange} disabled={disabled}>
            <div className={`relative ${className}`}>
                <Listbox.Button
                    className={classNames(
                        'flex items-center justify-between gap-2 border rounded-xl px-3 py-2.5 sm:py-1.5 text-base sm:text-sm w-full text-left transition-colors focus:outline-none focus:ring-2',
                        warning
                            ? 'border-amber-400 bg-amber-50 focus:border-indigo-400 focus:ring-indigo-100'
                            : 'border-gray-300 bg-white focus:border-indigo-400 focus:ring-indigo-100',
                        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    )}
                >
                    <span className={classNames('truncate', !value && 'text-gray-400')}>
                        {value ? label : placeholder}
                    </span>
                    <ChevronUpDownIcon className="w-4 h-4 text-gray-400 shrink-0" />
                </Listbox.Button>
                <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <Listbox.Options className="absolute z-20 mt-1 max-h-64 min-w-full w-max max-w-[min(20rem,calc(100vw-2rem))] overflow-auto rounded-xl bg-white py-1 text-sm shadow-lg border border-gray-100 focus:outline-none">
                        {children}
                    </Listbox.Options>
                </Transition>
            </div>
        </Listbox>
    );
}

function SelectOption({ value, label, special = false }) {
    return (
        <Listbox.Option
            value={value}
            className={({ active }) => classNames(
                'relative cursor-pointer select-none py-2 pl-3 pr-9',
                active ? 'bg-indigo-50' : '',
                special ? 'text-indigo-600 font-medium' : 'text-gray-700'
            )}
        >
            {({ selected }) => (
                <>
                    <span className={classNames('block truncate', selected && !special ? 'font-semibold' : '')}>{label}</span>
                    {selected && (
                        <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-indigo-600">
                            <CheckIcon className="w-4 h-4" />
                        </span>
                    )}
                </>
            )}
        </Listbox.Option>
    );
}

function SelectGroup({ label, children }) {
    return (
        <div>
            <div className="px-3 pt-2 pb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</div>
            {children}
        </div>
    );
}

function SelectDivider() {
    return <div className="my-1 border-t border-gray-100" />;
}

function SelectEmpty({ children }) {
    return <div className="px-3 py-2 text-gray-400">{children}</div>;
}

Select.Option = SelectOption;
Select.Group = SelectGroup;
Select.Divider = SelectDivider;
Select.Empty = SelectEmpty;
