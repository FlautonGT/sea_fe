import { Metadata } from 'next';
import { getProducts } from '@/lib/api';
import { t } from '@/lib/translations';

type Props = {
    params: { locale: string; slug: string };
    children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const locale = params.locale || 'id';
    const slug = params.slug;

    try {
        // Fetch product data for SEO
        // We use 'ID' as default region for SEO purposes/server-side defaults
        const productsRes = await getProducts('ID');

        if (productsRes.data && Array.isArray(productsRes.data)) {
            const product = productsRes.data.find((p: any) => p.slug === slug);
            if (product) {
                const titleTemplate = t('productTitleTemplate', locale);
                const title = titleTemplate.replace('{name}', product.title);

                return {
                    title: title,
                    description: product.subtitle || `Top up ${product.title} murah dan cepat.`,
                    openGraph: {
                        title: title,
                        description: product.subtitle,
                        images: [product.banner || product.thumbnail],
                    }
                };
            }
        }
    } catch (e) {
        console.error('Metadata generation failed:', e);
    }

    return {
        title: t('homeTitle', locale),
    };
}

export default function ProductLayout({ children }: Props) {
    return <>{children}</>;
}
