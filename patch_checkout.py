import sys
import re

with open('src/pages/Checkout.tsx', 'r') as f:
    content = f.read()

# Replace the handler and inject handleSuccess and the mock checkout logic

pattern = re.compile(r'      const options = \{\n        key:(.*?)\n        handler: async function \(response: any\) \{(.*?)\},\n        prefill:', re.DOTALL)

match = pattern.search(content)
if match:
    options_part1 = match.group(1)
    handler_body = match.group(2)
    
    new_code = f'''      const handleSuccess = async (response: any) => {{{handler_body}}};

      if (orderData.id.startsWith('order_mock_')) {{
        console.warn('Using mock payment flow');
        const mockResponse = {{
          razorpay_payment_id: 'pay_mock_' + Math.random().toString(36).substring(7),
          razorpay_order_id: orderData.id,
          razorpay_signature: 'mock_signature'
        }};
        setTimeout(() => {{
          handleSuccess(mockResponse);
        }}, 1000);
        return;
      }}

      const options = {{
        key:{options_part1}
        handler: handleSuccess,
        prefill:'''
        
    content = content[:match.start()] + new_code + content[match.end():]
    with open('src/pages/Checkout.tsx', 'w') as f:
        f.write(content)
    print("Patched Checkout.tsx successfully")
else:
    print("Could not match regex")

