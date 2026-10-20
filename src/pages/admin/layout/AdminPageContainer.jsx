
import "./AdminPageContainer.css";

export default function AdminPageContainer({
    children,
    title,
    subtitle,
    actions,
    breadcrumbs,
    className = "",
    fluid = false,
}) {
    return (
        <main
            className={[
                "admin-page-container",
                fluid ? "admin-page-container--fluid" : "",
                className,
            ]
                .filter(Boolean)
                .join(" ")}
        >
            {breadcrumbs && (
                <nav
                    className="admin-breadcrumbs"
                    aria-label="Breadcrumb"
                >
                    {breadcrumbs.map((item, index) => (
                        <span
                            key={`${item.label}-${index}`}
                            className="admin-breadcrumb-item"
                        >
                            {index > 0 && (
                                <span className="admin-breadcrumb-separator">
                                    /
                                </span>
                            )}

                            {item.href ? (
                                <a href={item.href}>{item.label}</a>
                            ) : (
                                <span>{item.label}</span>
                            )}
                        </span>
                    ))}
                </nav>
            )}

            {(title || subtitle || actions) && (
                <div className="admin-page-heading">
                    <div className="admin-page-heading-content">
                        {title && (
                            <h1 className="admin-page-title">
                                {title}
                            </h1>
                        )}

                        {subtitle && (
                            <p className="admin-page-subtitle">
                                {subtitle}
                            </p>
                        )}
                    </div>

                    {actions && (
                        <div className="admin-page-actions">
                            {actions}
                        </div>
                    )}
                </div>
            )}

            <div className="admin-page-content">
                {children}
            </div>
        </main>
    );
}
