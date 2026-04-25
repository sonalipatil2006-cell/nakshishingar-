import React from 'react';

const RefundPolicy = () => {
    return (
        <div style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial, sans-serif', color: '#333', lineHeight: '1.6' }}>
            <h1 style={{ textAlign: 'center', color: '#8b0000' }}>Return & Refund Policy</h1>
            <p style={{ textAlign: 'center', color: '#666' }}>Last Updated: April 24, 2026</p>
            
            <section style={{ marginTop: '30px' }}>
                <h2 style={{ color: '#555', borderBottom: '2px solid #f0f0f0', paddingBottom: '10px' }}>1. Returns</h2>
                <p>We want you to be completely satisfied with your purchase. If you are not happy with your jewelry, you can return it within **7 days** of delivery.</p>
                <p>To be eligible for a return, your item must be:</p>
                <ul>
                    <li>Unused and in the same condition that you received it.</li>
                    <li>In the original packaging.</li>
                    <li>Accompanied by the receipt or proof of purchase.</li>
                </ul>
            </section>

            <section style={{ marginTop: '30px' }}>
                <h2 style={{ color: '#555', borderBottom: '2px solid #f0f0f0', paddingBottom: '10px' }}>2. Refunds</h2>
                <p>Once we receive your item, we will inspect it and notify you that we have received your returned item. We will immediately notify you on the status of your refund after inspecting the item.</p>
                <p>If your return is approved, we will initiate a refund to your original method of payment (or bank transfer for COD orders). You will receive the credit within **5-7 working days**.</p>
            </section>

            <section style={{ marginTop: '30px' }}>
                <h2 style={{ color: '#555', borderBottom: '2px solid #f0f0f0', paddingBottom: '10px' }}>3. Shipping Costs</h2>
                <p>You will be responsible for paying for your own shipping costs for returning your item. Shipping costs are non-refundable.</p>
            </section>

            <section style={{ marginTop: '30px' }}>
                <h2 style={{ color: '#555', borderBottom: '2px solid #f0f0f0', paddingBottom: '10px' }}>4. Contact Us</h2>
                <p>If you have any questions on how to return your item to us, contact us at **nakshishrungar@gmail.com** or call us at **+91 9876543210**.</p>
            </section>

            <div style={{ marginTop: '50px', textAlign: 'center', backgroundColor: '#fff5f5', padding: '20px', borderRadius: '10px' }}>
                <h3>Shop with Confidence!</h3>
                <p>Your satisfaction is our priority at Nakshishrungar.</p>
            </div>
        </div>
    );
};

export default RefundPolicy;
