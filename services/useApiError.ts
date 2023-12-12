import HomeContext from "@/pages/api/home/home.context";
import { ErrorResponseCode } from "@/types/error";
import { $Dictionary } from "i18next/typescript/helpers";
import { TOptionsBase } from "i18next/typescript/options";
import { InterpolationMap } from "i18next/typescript/t.v4";
import { useContext } from "react";
import { useTranslation } from "react-i18next";

interface TranslationContext {
  supportEmail?: string | null
}

const useApiError = () => {
  const {
    state: {
      supportEmail
    },
  } = useContext(HomeContext);
  const { t } = useTranslation("error");
  const translationContext: TranslationContext = { supportEmail };
  const defaultMessage = t("errorDefault", translationContext as TOptionsBase & $Dictionary & InterpolationMap<string>) || "Error";

  const resolveResponseMessage = async (error: any): Promise<string> => {
    if (error instanceof Response) {
      const json = await error.json();
      if (json.error?.code) {
        if (json.error.code == ErrorResponseCode.ERROR_DEFAULT || !supportEmail) {
          return json.error?.message || defaultMessage;
        }
        return t(json.error.code.toString(), translationContext as TOptionsBase & $Dictionary & InterpolationMap<string>) || defaultMessage;
      } else {
        return t(json.error || json.message) || defaultMessage;
      }
    } else {
      return typeof error == "string" ? t(error) : defaultMessage;
    }
  }

  return {
    resolveResponseMessage,
  };
}

export default useApiError;