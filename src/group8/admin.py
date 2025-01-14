from django.contrib import admin
from .models import Request
# Register your models here.

class RequestAdmin(admin.ModelAdmin):
    list_display = ('user', 'word', 'request_type', 'status', 'created_at')
    list_filter = ('request_type', 'status', 'created_at')
    search_fields = ('user__username', 'word__title')

admin.site.register(Request, RequestAdmin)