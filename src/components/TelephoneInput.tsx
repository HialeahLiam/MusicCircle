import { isValidPhoneNumber, parsePhoneNumber } from "libphonenumber-js";
import React, { useState } from "react";

const DEFAULT_COUNTRY = "US";

function TelephoneInput() {
  const [number, setNumber] = useState("");
  const [country, setCountry] = useState(DEFAULT_COUNTRY);
  const [numberValidated, setNumberValidated] = useState(false);
  const [isNumberValid, setIsNumberValid] = useState(true);

  const _setPhoneNumber = (number: string) => {
    setNumber(number);
    try {
      const { country } = parsePhoneNumber(number, DEFAULT_COUNTRY);
      country && setCountry(country);
    } catch (error) {}
  };

  const _validateNumber = () => {
    setNumberValidated(true);
    if (!number.length) return;
    try {
      const { number: parsedNumber } = parsePhoneNumber(
        number,
        DEFAULT_COUNTRY
      );
      const isValid = isValidPhoneNumber(parsedNumber);
      setIsNumberValid(isValid);
    } catch (error) {
      setIsNumberValid(false);
    }
  };
  return (
    <div className="flex  flex-col">
      <div className="mb-4 flex flex items-center gap-2 ">
        <span className=" text-xs">{country}</span>
        {country === "US" ? (
          <span className="text-sm">SMS</span>
        ) : (
          <span className="text-sm">WhatsApp</span>
        )}
      </div>
      <input
        className={
          " max-w-fit rounded-lg border-2 px-4" +
          (numberValidated
            ? isNumberValid
              ? " border-green-500 "
              : " border-red-400 "
            : "")
        }
        type="tel"
        name=""
        id=""
        value={number}
        onChange={({ target }) => _setPhoneNumber(target.value)}
        onBlur={_validateNumber}
      />
    </div>
  );
}

export default TelephoneInput;
