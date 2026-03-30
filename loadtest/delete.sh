POD=$(kubectl get pods -l app=photoalbum-backend -o jsonpath='{.items[0].metadata.name}')

oc exec $POD -- python manage.py shell -c "from api.models import Photo; [ (p.file.delete(save=False), p.delete()) for p in Photo.objects.all() ]"