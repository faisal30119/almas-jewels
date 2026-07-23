import sys

with open('firestore.rules', 'r') as f:
    content = f.read()

target = """    match /orders/{orderId} {
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && request.auth.token.email == 'faisal301196@gmail.com';
    }"""
replacement = """    match /orders/{orderId} {
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow update: if request.auth != null && (resource.data.userId == request.auth.uid || request.auth.token.email == 'faisal301196@gmail.com');
      allow delete: if request.auth != null && request.auth.token.email == 'faisal301196@gmail.com';
    }"""

if target in content:
    content = content.replace(target, replacement)
    print("Patched rules")
else:
    print("Target rules not found")

with open('firestore.rules', 'w') as f:
    f.write(content)
