import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";

function LanguageSwitcher() {
    const { i18n } = useTranslation();

    const changeLanguage = (language) => {
        i18n.changeLanguage(language);
        localStorage.setItem("language", language);
    };

    return (
        <div className="dropdown">
            <button
                className="btn btn-light border rounded-pill d-flex align-items-center gap-2"
                type="button"
                data-bs-toggle="dropdown"
            >
                <Globe size={18} />

                {i18n.language === "vi"
                    ? "Tiếng Việt"
                    : "English"}
            </button>

            <ul className="dropdown-menu dropdown-menu-end">

                <li>
                    <button
                        className={`dropdown-item ${
                            i18n.language === "vi"
                                ? "active"
                                : ""
                        }`}
                        onClick={() =>
                            changeLanguage("vi")
                        }
                    >
                        🇻🇳 Tiếng Việt
                    </button>
                </li>

                <li>
                    <button
                        className={`dropdown-item ${
                            i18n.language === "en"
                                ? "active"
                                : ""
                        }`}
                        onClick={() =>
                            changeLanguage("en")
                        }
                    >
                        🇬🇧 English
                    </button>
                </li>

            </ul>
        </div>
    );
}

export default LanguageSwitcher;